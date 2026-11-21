import type { ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DECLARATIONS, type ApplicationData, type Field, type Row, type Value } from './schema';

const inputClass = (hasError: boolean) =>
  `w-full px-3.5 py-2.5 text-sm bg-[#FFFDF7] border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
    hasError
      ? 'border-red-500 focus:border-red-600 focus:ring-red-600'
      : 'border-slate-300 focus:border-[#082E43] focus:ring-[#082E43]'
  }`;

const digitsOnly = (s: string) => s.replace(/\D/g, '');
const groupDigits = (s: string) => (s ? Number(s).toLocaleString('en-US') : '');

interface Props {
  field: Field;
  data: ApplicationData;
  error?: string;
  onChange: (name: string, value: Value) => void;
}

export function FieldInput({ field, data, error, onChange }: Props) {
  const id = `la-${field.name}`;
  const value = data[field.name];
  const describedBy = [error ? `${id}-error` : '', field.hint ? `${id}-hint` : '']
    .filter(Boolean)
    .join(' ') || undefined;

  const label = (
    <span className="block text-sm font-medium text-slate-700 mb-1.5">
      {field.label}
      {field.required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
    </span>
  );

  const footer = (
    <>
      {field.hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {field.hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </>
  );

  const wrapper = field.full ? 'sm:col-span-2' : '';

  switch (field.type) {
    case 'radio':
    case 'checks': {
      const isRadio = field.type === 'radio';
      const selected = isRadio ? (value as string) : ((value as string[]) ?? []);
      return (
        <fieldset className={wrapper} aria-describedby={describedBy}>
          <legend className="contents">{label}</legend>
          <div className={`flex flex-wrap gap-2 ${isRadio ? '' : 'sm:grid sm:grid-cols-2'}`}>
            {field.options!.map((opt) => {
              const checked = isRadio ? selected === opt : (selected as string[]).includes(opt);
              return (
                <label
                  key={opt}
                  className={`inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                    checked
                      ? 'bg-[#082E43] border-[#082E43] text-white'
                      : `bg-[#FFFDF7] text-slate-700 hover:border-[#082E43]/50 ${error ? 'border-red-400' : 'border-slate-300'}`
                  }`}
                >
                  <input
                    type={isRadio ? 'radio' : 'checkbox'}
                    name={id}
                    value={opt}
                    checked={checked}
                    onChange={() => {
                      if (isRadio) onChange(field.name, opt);
                      else {
                        const list = selected as string[];
                        onChange(field.name, checked ? list.filter((o) => o !== opt) : [...list, opt]);
                      }
                    }}
                    className="accent-[#073035] w-4 h-4 shrink-0"
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
          {footer}
        </fieldset>
      );
    }

    case 'consent':
      return (
        <div className={wrapper}>
          <ol className="space-y-3 p-5 rounded-xl bg-[#F4F8FB] border border-slate-200 text-sm text-slate-700 leading-relaxed list-decimal list-outside pl-9">
            {DECLARATIONS.map((d) => (
              <li key={d.slice(0, 24)}>{d}</li>
            ))}
          </ol>
          <label className="mt-4 flex items-start gap-3 cursor-pointer">
            <input
              id={id}
              type="checkbox"
              checked={value === true}
              onChange={(e) => onChange(field.name, e.target.checked)}
              aria-describedby={describedBy}
              aria-invalid={!!error}
              className="mt-0.5 w-5 h-5 accent-[#073035] shrink-0"
            />
            <span className="text-sm font-semibold text-slate-900">
              {field.label}
              <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>
            </span>
          </label>
          {footer}
        </div>
      );

    case 'table':
      return (
        <TableInput field={field} rows={(value as Row[]) ?? []} onChange={onChange} footer={footer} label={label} />
      );

    case 'select':
      return (
        <label className={`block ${wrapper}`}>
          {label}
          <select
            id={id}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={inputClass(!!error)}
          >
            <option value="">Select…</option>
            {field.options!.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          {footer}
        </label>
      );

    case 'textarea':
      return (
        <label className={`block ${wrapper}`}>
          {label}
          <textarea
            id={id}
            rows={3}
            value={(value as string) ?? ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.name, e.target.value)}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={inputClass(!!error)}
          />
          {footer}
        </label>
      );

    case 'money':
      return (
        <label className={`block ${wrapper}`}>
          {label}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 pointer-events-none">
              RWF
            </span>
            <input
              id={id}
              inputMode="numeric"
              value={groupDigits((value as string) ?? '')}
              onChange={(e) => onChange(field.name, digitsOnly(e.target.value).slice(0, 13))}
              aria-invalid={!!error}
              aria-describedby={describedBy}
              className={`${inputClass(!!error)} pl-12 tabular-nums`}
            />
          </div>
          {footer}
        </label>
      );

    default:
      return (
        <label className={`block ${wrapper}`}>
          {label}
          <input
            id={id}
            type={field.type === 'number' ? 'text' : field.type}
            inputMode={field.type === 'number' ? 'numeric' : field.type === 'tel' ? 'tel' : undefined}
            autoComplete={autoComplete(field.name)}
            value={(value as string) ?? ''}
            placeholder={field.placeholder}
            onChange={(e) =>
              onChange(field.name, field.type === 'number' ? digitsOnly(e.target.value).slice(0, 4) : e.target.value)
            }
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={inputClass(!!error)}
          />
          {footer}
        </label>
      );
  }
}

function autoComplete(name: string) {
  return (
    {
      fullName: 'name',
      signatureName: 'name',
      mobile: 'tel',
      email: 'email',
      dob: 'bday',
      nationality: 'country-name',
    } as Record<string, string>
  )[name];
}

function TableInput({
  field,
  rows,
  onChange,
  label,
  footer,
}: {
  field: Field;
  rows: Row[];
  onChange: (name: string, value: Value) => void;
  label: ReactNode;
  footer: ReactNode;
}) {
  const columns = field.columns!;
  const update = (i: number, col: string, v: string) =>
    onChange(field.name, rows.map((r, j) => (j === i ? { ...r, [col]: v } : r)));

  return (
    <div className="sm:col-span-2">
      {label}
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="p-4 rounded-xl border border-slate-200 bg-[#F4F8FB]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Entry {i + 1}</p>
              <button
                type="button"
                onClick={() => onChange(field.name, rows.filter((_, j) => j !== i))}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {columns.map((c) => (
                <label key={c.name} className="block">
                  <span className="block text-xs font-medium text-slate-600 mb-1">{c.label}</span>
                  <input
                    type={c.date ? 'date' : 'text'}
                    inputMode={c.money ? 'numeric' : undefined}
                    value={c.money ? groupDigits(row[c.name] ?? '') : row[c.name] ?? ''}
                    onChange={(e) =>
                      update(i, c.name, c.money ? digitsOnly(e.target.value).slice(0, 13) : e.target.value)
                    }
                    className={inputClass(false)}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange(field.name, [...rows, {}])}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#082E43] border border-dashed border-[#082E43]/40 hover:border-[#082E43] hover:bg-[#F4F8FB] rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add {rows.length ? 'another' : 'an'} entry
        </button>
      </div>
      {footer}
    </div>
  );
}
