import { Check } from 'lucide-react';
import type { PracticeQuestion } from './types';

export default function QuestionOptions({
  question,
  answer,
  onChange,
}: {
  question: PracticeQuestion;
  answer: number[];
  onChange: (answer: number[]) => void;
}) {
  return (
    <div className="ws-practice-options" role="group" aria-label="练习答案">
      {question.options.map((option, index) => {
        const selected = answer.includes(index);
        return (
          <button
            key={option}
            className={`ws-practice-option ${selected ? 'selected' : ''}`}
            aria-pressed={selected}
            onClick={() =>
              onChange(
                question.kind === 'multiple'
                  ? selected
                    ? answer.filter((item) => item !== index)
                    : [...answer, index]
                  : [index],
              )
            }
          >
            <span className="ws-option-mark">{selected && <Check size={15} />}</span>
            {option}
          </button>
        );
      })}
    </div>
  );
}
