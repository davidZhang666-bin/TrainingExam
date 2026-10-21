export function downloadFile(name: string, data: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const escapeXml = (text: string) =>
  text.replace(
    /[<>&"']/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!,
  );
export function certificateSvg(name: string, title: string, date: string, id: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700"><rect width="1000" height="700" fill="#faf8ff"/><rect x="28" y="28" width="944" height="644" rx="4" fill="none" stroke="#c6b4de"/><rect x="38" y="38" width="924" height="624" fill="none" stroke="#e5d9f1"/><circle cx="500" cy="115" r="30" fill="#e9dff3"/><path d="m484 115 11 11 22-25" fill="none" stroke="#a78bbb" stroke-width="4"/><g font-family="sans-serif" text-anchor="middle"><text x="500" y="190" fill="#aa8fc1" font-size="13" letter-spacing="6">ZHIXU ACADEMY</text><text x="500" y="255" fill="#68517e" font-size="37" letter-spacing="8">学习成长证书</text><text x="500" y="315" fill="#a693b5" font-size="16">兹证明</text><text x="500" y="375" fill="#715787" font-size="32">${escapeXml(name)}</text><text x="500" y="430" fill="#a18bb2" font-size="16">已通过「${escapeXml(title)}」</text><text x="500" y="466" fill="#b6a2c5" font-size="14">每一份认真，都值得被看见。</text><text x="500" y="545" fill="#a690b9" font-size="13">${escapeXml(date)}</text><text x="500" y="585" fill="#bbaaC7" font-size="10">证书编号 ${escapeXml(id)}</text><text x="500" y="630" fill="#b9a9c6" font-size="10">知序学习 · 本地演示学习证明</text></g></svg>`;
}
