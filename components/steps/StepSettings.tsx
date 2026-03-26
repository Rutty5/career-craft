"use client";

import type { UserSettings } from "@/lib/types";
import { INDUSTRIES, JOB_TYPES, AGE_GROUPS, MODE_OPTIONS } from "@/lib/constants";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface StepSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
  onNext: () => void;
}

export default function StepSettings({
  settings,
  onUpdate,
  onNext,
}: StepSettingsProps) {
  const isValid =
    settings.name.trim() &&
    settings.email.trim() &&
    settings.ageGroup &&
    settings.industry &&
    settings.jobType &&
    settings.transferType &&
    settings.mode;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="name"
            className="text-sm font-semibold text-text-main"
          >
            お名前 <span className="text-error">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={settings.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="山田 太郎"
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-text-main"
          >
            メールアドレス <span className="text-error">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={settings.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder="example@email.com"
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="年代 *"
          options={AGE_GROUPS}
          value={settings.ageGroup}
          onChange={(e) =>
            onUpdate({
              ageGroup: e.target.value as UserSettings["ageGroup"],
            })
          }
        />
        <Select
          label="転職タイプ *"
          options={["同業種", "異業種"]}
          value={settings.transferType}
          onChange={(e) =>
            onUpdate({
              transferType: e.target.value as UserSettings["transferType"],
            })
          }
        />
      </div>

      {settings.transferType === "異業種" && (
        <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 text-sm text-text-main">
          <span className="font-bold text-gold">異業種転職モード: </span>
          ポータブルスキルを前面に出し、異なる視点を活かした価値創出を訴求します。業界用語を避け、誰でもわかる言葉で成果を表現します。
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="応募先の業界 *"
          options={INDUSTRIES}
          value={settings.industry}
          onChange={(e) => onUpdate({ industry: e.target.value })}
        />
        <Select
          label="応募先の職種 *"
          options={JOB_TYPES}
          value={settings.jobType}
          onChange={(e) => onUpdate({ jobType: e.target.value })}
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-text-main mb-3">
          モード <span className="text-error">*</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODE_OPTIONS.map((mode) => (
            <Card
              key={mode.id}
              selected={settings.mode === mode.id}
              className="cursor-pointer text-center"
              onClick={() => onUpdate({ mode: mode.id })}
              role="button"
              tabIndex={0}
              aria-pressed={settings.mode === mode.id}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onUpdate({ mode: mode.id });
                }
              }}
            >
              <div className="text-3xl mb-2">{mode.icon}</div>
              <div className="font-bold text-navy text-sm">{mode.label}</div>
              <div className="text-xs text-text-light mt-1">{mode.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={!isValid} size="lg">
          次へ →
        </Button>
      </div>
    </div>
  );
}
