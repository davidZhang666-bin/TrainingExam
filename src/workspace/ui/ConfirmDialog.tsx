import Modal from '../../components/Modal';

export default function ConfirmDialog({
  title,
  description,
  confirm = '确认',
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirm?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose} className="ws-dialog">
      <span className="eyebrow">YOUR LEARNING SPACE</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="dialog-actions">
        <button className="button" onClick={onClose}>
          取消
        </button>
        <button
          className="button primary"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirm}
        </button>
      </div>
    </Modal>
  );
}
