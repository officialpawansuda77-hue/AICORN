import { NextRequest, NextResponse } from "next/server";
import { extractGoogleDriveId } from "@/lib/media-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();
    const url = searchParams.get("url")?.trim();

    let targetUrl = "";

    if (id) {
      targetUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=download`;
    } else if (url) {
      const driveId = extractGoogleDriveId(url);
      if (driveId) {
        targetUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(driveId)}&export=download`;
      } else if (url.startsWith("http://") || url.startsWith("https://")) {
        targetUrl = url;
      }
    }

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing or invalid media URL/ID" }, { status: 400 });
    }

    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "*/*",
    };

    const clientRange = request.headers.get("range");
    if (clientRange) {
      headers["Range"] = clientRange;
    }

    const upstreamRes = await fetch(targetUrl, {
      redirect: "follow",
      headers,
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      return NextResponse.json(
        { error: "Failed to fetch media stream from upstream" },
        { status: upstreamRes.status }
      );
    }

    const contentType = upstreamRes.headers.get("content-type");
    // If upstream unexpectedly returned HTML (e.g. Google Drive virus warning or auth screen)
    if (contentType && contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "Media stream is unavailable or restricted" },
        { status: 403 }
      );
    }

    const responseHeaders = new Headers();
    responseHeaders.set(
      "Content-Type",
      contentType && !contentType.includes("binary") && !contentType.includes("octet-stream")
        ? contentType
        : "video/mp4"
    );

    const contentLength = upstreamRes.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    const contentRange = upstreamRes.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    const acceptRanges = upstreamRes.headers.get("accept-ranges");
    responseHeaders.set("Accept-Ranges", acceptRanges || "bytes");

    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Range, Accept");
    responseHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");
    responseHeaders.set("Content-Disposition", "inline");
    responseHeaders.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");

    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Accept",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}
