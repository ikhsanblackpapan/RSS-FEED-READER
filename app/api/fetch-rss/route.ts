import { NextRequest, NextResponse } from "next/server";
import { title } from "process";
import Parser from "rss-parser";
import { deserialize } from "v8";

const parser = new Parser({
  timeout: 10000, //10 detik timeout untuk mencegah request yang terlalu lama
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  console.log("memproses URL:", url);

  if (!url || url === "undefined") {
    return NextResponse.json(
      { error: "URL parameter is missing or invalid" },
      { status: 400 },
    );
  }

  if (!url.startsWith("http")) {
    return NextResponse.json(
      { error: "Invalid URL protocol" },
      { status: 400 },
    );
  }

  try {
    //1. ambil data mentah (xml) menggunakan fetch bawaan next js agar bisa di cache
    const response = await fetch(url, {
      cache: "no-store", //mematikan cache khusus untuk file jumbo
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36", //menambahkan user agent untuk menghindari blokir dari beberapa server
      },
    });

    if (!response.ok)
      throw new Error(`gagal mengambil data dari sumber: ${response.status}`);

    const xmlData = await response.text();

    //2 parse data xml yang sudah di-donwload
    const feed = await parser.parseString(xmlData);

   const itemsWithSource = feed.items.slice(0, 20).map((item) => ({
      ...item,
      feedUrl: url, // Kita tempelkan URL aslinya di sini
    }));

    const result = {
      title: feed.title,
      description: feed.description,
      link: feed.link, // 'link' kecil biasanya lebih standar di RSS
      items: itemsWithSource, // Gunakan items yang sudah dimodifikasi
    }

    // const result = {
    //   title: feed.title,
    //   description: feed.description,
    //   Link: feed.link,
    //   items: feed.items.slice(0, 20),
    // };

    return NextResponse.json({
      items: itemsWithSource,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    //3. tambahkan block catch untuk menangani error agar tidak crash
    console.error("RSS parse ERROR:", error);
    return NextResponse.json(
      {
        error: "Failed to parse RSS feed",
        detail: error.message,
      },
      { status: 500 },
    );
  }
}
