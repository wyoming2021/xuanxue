import { ImageResponse } from 'next/og';

export const alt = '玄语 XuanYu · 每日运势与命理文章';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * 文章分享图（OG Image）：自动生成 1200x630 的品牌分享卡片。
 * Next.js 会把它挂载为 /articles/[slug]/opengraph-image，并自动写入 og:image。
 */
export default async function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1c1917 0%, #292524 45%, #1e1b4b 100%)',
        fontFamily: 'sans-serif',
        color: '#e7e5e4',
        position: 'relative',
      }}
    >
      {/* 装饰圆点 */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 90,
          width: 180,
          height: 180,
          borderRadius: 9999,
          background: 'rgba(129, 140, 248, 0.18)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          right: 100,
          width: 240,
          height: 240,
          borderRadius: 9999,
          background: 'rgba(168, 162, 158, 0.12)',
        }}
      />
      <div style={{ fontSize: 100, lineHeight: 1 }}>🔮</div>
      <div style={{ fontSize: 76, fontWeight: 700, marginTop: 28, letterSpacing: 4 }}>XuanYu</div>
      <div
        style={{
          fontSize: 30,
          color: '#a8a29e',
          marginTop: 18,
          letterSpacing: 2,
        }}
      >
        Metaphysics · Fortune · Culture
      </div>
    </div>,
    { ...size },
  );
}
