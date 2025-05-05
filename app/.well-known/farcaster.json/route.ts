import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {
    accountAssociation: {
      header:
        "eyJmaWQiOjUyMjIyNiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweEM0Yzk0ZmNjNTVmMWRkOUVBZjE0NEI1MDg0QWNBN2YyZWE5NzBiMzIifQ",
      payload:
        "eyJkb21haW4iOiJtb25hZC0yMDQ4LW1pbmlhcHAudmVyY2VsLmFwcCJ9",
      signature:
        "MHhjM2YyNGM4NjEwZGRjOTVmZTk3ZDhiZWFiOWI2MzQ2NGRhYTZmNzI1NDFjYjZjOTFiMGU2MDU1YTI0ODlhNDkxMWEyMTFjZWEzZWVkODdmYmUxZjYzOWViMTAwYmExYWRkYWJmZGUyNzM1OWMzN2RiZWUyNzA4MDNhZGEzZDJlZDFj",
    },
    frame: {
      version: "1",
      name: "Monad 2048 MiniApp",
      iconUrl: `${APP_URL}/images/icon.png`,
      homeUrl: `${APP_URL}`,
      imageUrl: `${APP_URL}/images/feed.png`,
      screenshotUrls: [],
      tags: ["monad", "farcaster", "miniapp", "2048"],
      description: "2048 popular game for Monad testnet",
      primaryCategory: "games",
      buttonTitle: "Launch game",
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: "#ffffff",
      webhookUrl: `${APP_URL}/api/webhook`,
    },
  };

  return NextResponse.json(farcasterConfig);
}
