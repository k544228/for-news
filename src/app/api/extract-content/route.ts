import { NextResponse } from 'next/server';
const Mercury = require('@postlight/mercury-parser');

// URL驗證函數
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// 清理和處理文字內容
function cleanTextContent(content: string): string {
  if (!content) return '';

  // 移除多餘的空白和換行
  return content
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

// 從HTML中提取純文字
function extractTextFromHtml(html: string): string {
  if (!html) return '';

  // 簡單的HTML標籤移除（在伺服器端環境）
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // 移除script標籤
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')   // 移除style標籤
    .replace(/<[^>]*>/g, '')                          // 移除所有HTML標籤
    .replace(/&nbsp;/g, ' ')                          // 替換&nbsp;
    .replace(/&amp;/g, '&')                           // 替換&amp;
    .replace(/&lt;/g, '<')                            // 替換&lt;
    .replace(/&gt;/g, '>')                            // 替換&gt;
    .replace(/&quot;/g, '"')                          // 替換&quot;
    .replace(/&#39;/g, "'")                           // 替換&#39;
    .replace(/\s+/g, ' ')                             // 合併多個空格
    .trim();
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // 驗證URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: '請提供有效的URL' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: '無效的URL格式，請提供完整的http或https網址' },
        { status: 400 }
      );
    }

    console.log(`開始擷取內容: ${url}`);

    // 使用Mercury解析網頁內容
    const result = await Mercury.parse(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!result) {
      throw new Error('無法解析網頁內容');
    }

    // 處理解析結果
    const extractedContent = {
      title: result.title || '無標題',
      content: result.content || '',
      textContent: cleanTextContent(
        result.excerpt ||
        extractTextFromHtml(result.content || '') ||
        '無法擷取文字內容'
      ),
      author: result.author || null,
      publishDate: result.date_published || null,
      url: url,
      wordCount: result.word_count || 0,
      leadImage: result.lead_image_url || null,
      domain: result.domain || '',
      excerpt: result.excerpt || null
    };

    // 檢查是否成功擷取到有意義的內容
    if (!extractedContent.title && !extractedContent.textContent) {
      return NextResponse.json(
        {
          error: '無法從該網址擷取有效內容，可能是網站有反爬蟲保護或內容結構特殊',
          details: '建議嘗試其他新聞網站的文章連結'
        },
        { status: 422 }
      );
    }

    console.log(`✅ 內容擷取成功: ${extractedContent.title}`);
    console.log(`📝 文字長度: ${extractedContent.textContent.length} 字符`);

    return NextResponse.json({
      success: true,
      ...extractedContent,
      extractedAt: new Date().toISOString(),
      note: '內容已使用Mercury技術成功擷取'
    });

  } catch (error) {
    console.error('內容擷取錯誤:', error);

    // 根據錯誤類型返回不同的訊息
    let errorMessage = '內容擷取失敗';
    let details = '';

    if (error instanceof Error) {
      if (error.message.includes('getaddrinfo')) {
        errorMessage = '無法連接到該網站';
        details = '請檢查網址是否正確，或網站是否可正常訪問';
      } else if (error.message.includes('timeout')) {
        errorMessage = '連接超時';
        details = '網站響應時間過長，請稍後再試';
      } else if (error.message.includes('403') || error.message.includes('401')) {
        errorMessage = '網站拒絕訪問';
        details = '該網站可能有反爬蟲保護，無法擷取內容';
      } else if (error.message.includes('404')) {
        errorMessage = '頁面不存在';
        details = '請檢查網址是否正確';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: details || '請嘗試其他新聞網站，或檢查網址是否正確',
        url: request.url
      },
      { status: 500 }
    );
  }
}