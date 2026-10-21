import { useRef, useState } from 'react';
import { Download, Upload, FileCheck2 } from 'lucide-react';
import type { LearningState } from '../domain';
import { useLearning } from '../store';
import { createBackup, parseBackup, reportCsv } from '../backup';
import { downloadFile } from '../downloads';
import Modal from './Modal';
export default function DataBackup({ onRestore }: { onRestore: (data: LearningState) => void }) {
  const { state, restore } = useLearning();
  const input = useRef<HTMLInputElement>(null);
  const [candidate, setCandidate] = useState<LearningState | null>(null);
  const [error, setError] = useState('');
  return (
    <section className="panel backup-panel">
      <div>
        <h3>把成长记录，妥善珍藏</h3>
        <p>导出完整备份，或将之前的备份恢复到当前浏览器。</p>
      </div>
      <div className="backup-actions">
        <button
          className="button"
          onClick={() =>
            downloadFile('知序学习-完整备份.json', createBackup(state), 'application/json')
          }
        >
          <Download size={13} />
          导出备份
        </button>
        <button
          className="button"
          onClick={() =>
            downloadFile('知序学习-课程报告.csv', reportCsv(state), 'text/csv;charset=utf-8')
          }
        >
          <Download size={13} />
          导出报告
        </button>
        <button className="button" onClick={() => input.current?.click()}>
          <Upload size={13} />
          导入备份
        </button>
        <input
          ref={input}
          className="visually-hidden"
          type="file"
          accept=".json,application/json"
          aria-label="选择学习备份文件"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            setError('');
            try {
              if (file.size > 2_000_000) throw new Error('备份文件过大，请选择 2 MB 以内的文件。');
              setCandidate(parseBackup(await file.text()));
            } catch (reason) {
              setError(reason instanceof Error ? reason.message : '备份读取失败。');
            }
          }}
        />
      </div>
      {error && (
        <p className="backup-error" role="alert">
          {error}
        </p>
      )}
      {candidate && (
        <Modal title="确认导入备份" onClose={() => setCandidate(null)} className="exam-rules">
          <span className="eyebrow">WELCOME BACK TO YOUR JOURNEY</span>
          <h2>恢复这份学习记录？</h2>
          <div className="callout">
            <FileCheck2 size={18} />
            <br />
            {candidate.profile.name} · {candidate.enrolled.length} 门课程 ·{' '}
            {candidate.completed.length} 个完成章节 · {candidate.attempts.length} 次测评
          </div>
          <p>
            导入将覆盖当前浏览器的全部学习数据，包括正在进行的考试。建议先导出现有备份。备份中的过期考试将在恢复后自动交卷。
          </p>
          <div className="dialog-actions">
            <button className="button" onClick={() => setCandidate(null)}>
              取消
            </button>
            <button
              className="button primary"
              onClick={() => {
                restore(candidate);
                setCandidate(null);
                onRestore(candidate);
              }}
            >
              确认恢复备份
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
