import { useState } from 'react';
import { Award, Download, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { exams } from '../domain';
import { useLearning } from '../store';
import { downloadFile, certificateSvg } from '../downloads';
import PageIntro from '../components/PageIntro';
import Modal from '../components/Modal';
export default function Certificates({ onExams }: { onExams: () => void }) {
  const { state } = useLearning();
  const [preview, setPreview] = useState<string | null>(null);
  const earned = exams.flatMap((exam) => {
    const attempt = state.attempts.find((a) => a.examId === exam.id && a.score >= exam.pass);
    return attempt
      ? [
          {
            exam,
            attempt,
            id:
              'ZX-' +
              String(new Date(attempt.submittedAt).getFullYear()) +
              '-' +
              attempt.id.split('-').at(-1),
          },
        ]
      : [];
  });
  const selected = earned.find((c) => c.id === preview);
  const save = (item: (typeof earned)[number]) =>
    downloadFile(
      '知序学习-' + item.exam.title + '.svg',
      certificateSvg(
        state.profile.name,
        item.exam.title,
        new Date(item.attempt.submittedAt).toLocaleDateString('zh-CN'),
        item.id,
      ),
      'image/svg+xml;charset=utf-8',
    );
  return (
    <>
      <PageIntro
        title="成长的每一步，都值得珍藏"
        subtitle="它们记录的不只是成绩，还有每一次认真投入的你。"
        eyebrow="YOUR MOMENTS OF ACHIEVEMENT"
      >
        <span className="badge">
          <Award size={12} />
          {earned.length} 张成长证书
        </span>
      </PageIntro>
      {earned.length ? (
        <div className="certificate-grid">
          {earned.map((item) => (
            <article className="panel certificate-card" key={item.id}>
              <div className="certificate-mini">
                <span className="certificate-seal">
                  <Award size={28} strokeWidth={1.3} />
                </span>
                <small>ZHIXU ACADEMY</small>
                <h3>学习成长证书</h3>
                <span className="cert-line" />
                <p>{state.profile.name}</p>
                <strong>{item.exam.title}</strong>
                <span className="cert-ornament">✧</span>
              </div>
              <div className="certificate-info">
                <span className="badge green">测评已通过</span>
                <h3>{item.exam.title}</h3>
                <p>颁发于 {new Date(item.attempt.submittedAt).toLocaleDateString('zh-CN')}</p>
                <div>
                  <button className="button small" onClick={() => setPreview(item.id)}>
                    <Eye size={12} />
                    预览
                  </button>
                  <button className="button small primary" onClick={() => save(item)}>
                    <Download size={12} />
                    下载证书
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel empty-state certificate-empty">
          <Sparkles size={39} />
          <h3>下一份成长证明，属于认真学习的你</h3>
          <p>前往考试中心，通过任意一场测评，即可领取并下载你的第一张成长证书。</p>
          <button className="button primary" onClick={onExams}>
            去参加测评
            <ArrowRight size={14} />
          </button>
        </div>
      )}
      <p className="certificate-note">
        证书为本地演示学习证明，可下载为 SVG 图片；不作为专业资格或第三方认证。
      </p>
      {selected && (
        <Modal title="证书预览" onClose={() => setPreview(null)} className="certificate-preview">
          <div className="certificate-full">
            <Award size={40} />
            <span>ZHIXU ACADEMY</span>
            <h2>学习成长证书</h2>
            <p>兹证明</p>
            <h3>{state.profile.name}</h3>
            <p>已通过「{selected.exam.title}」</p>
            <p>每一份认真，都值得被看见。</p>
            <small>{new Date(selected.attempt.submittedAt).toLocaleDateString('zh-CN')}</small>
            <small>{selected.id}</small>
            <small>知序学习 · 本地演示学习证明</small>
          </div>
          <button className="button primary wide" onClick={() => save(selected)}>
            <Download size={14} />
            下载 SVG 证书
          </button>
        </Modal>
      )}
    </>
  );
}
