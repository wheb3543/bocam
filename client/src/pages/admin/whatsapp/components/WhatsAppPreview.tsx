/**
 * WhatsAppPreview - معاينة رسالة WhatsApp
 */

import { CheckCircle2 } from 'lucide-react';
import type { Template, TemplateButton } from '../types/template.types';

interface WhatsAppPreviewProps {
  template: Template;
}

export function WhatsAppPreview({ template }: WhatsAppPreviewProps) {
  const vars = template.variables ? JSON.parse(template.variables) : [];
  let preview = template.content;

  vars.forEach((v: string, i: number) => {
    preview = preview.replace(`{{${i + 1}}}`, `[${v}]`);
  });

  const buttons = template.buttons ? JSON.parse(template.buttons) : [];

  return (
    <div className="bg-[#e5ddd5] dark:bg-gray-800 rounded-xl p-3 max-w-xs mx-auto">
      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm relative">
        {(template.headerContent || template.headerText) && (
          <div className="font-semibold text-sm mb-2 pb-2 border-b">
            {template.headerContent || template.headerText}
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-100">
          {preview}
        </p>
        {(template.footerContent || template.footerText) && (
          <p className="text-[10px] text-gray-400 mt-2 pt-2 border-t">
            {template.footerContent || template.footerText}
          </p>
        )}
        {buttons.length > 0 && (
          <div className="mt-3 space-y-2">
            {buttons.map((button: TemplateButton, index: number) => (
              <button
                key={index}
                className={`w-full py-2 px-3 rounded-lg text-xs font-medium ${
                  button.type === 'QUICK_REPLY' || button.type === 'quick_reply'
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {button.text}
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-1">
          <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
            الآن <CheckCircle2 className="h-2.5 w-2.5 text-blue-500" />
          </span>
        </div>
      </div>
    </div>
  );
}
