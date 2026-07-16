'use client';

import { useState } from 'react';
import { ModifierGroup, ModifierOption, Lang } from '@/types/pos';
import { T } from '@/lib/i18n';

interface Props {
  groups: ModifierGroup[];
  lang: Lang;
  onGroupCreated: (group: ModifierGroup) => void;
  onGroupUpdated: (group: ModifierGroup) => void;
  onGroupDeleted: (id: string) => void;
  onOptionCreated: (groupId: string, option: ModifierOption) => void;
  onOptionUpdated: (groupId: string, option: ModifierOption) => void;
  onOptionDeleted: (groupId: string, optionId: string) => void;
}

function money(cents: number) {
  if (cents === 0) return 'Free';
  return '+$' + (cents / 100).toFixed(2);
}

interface NewOptionState {
  name: string;
  price: string;
  isDefault: boolean;
}

export default function ModifierManager({
  groups, lang,
  onGroupCreated, onGroupUpdated, onGroupDeleted,
  onOptionCreated, onOptionUpdated, onOptionDeleted,
}: Props) {
  const tr = T[lang];
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupRequired, setNewGroupRequired] = useState(false);
  const [newGroupSingle, setNewGroupSingle] = useState(true);
  const [addingGroup, setAddingGroup] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newOptions, setNewOptions] = useState<Record<string, NewOptionState>>({});
  const [addingOption, setAddingOption] = useState<Record<string, boolean>>({});
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [deletingGroup, setDeletingGroup] = useState(false);
  const [editingOption, setEditingOption] = useState<{ groupId: string; optionId: string; name: string; price: string } | null>(null);

  async function handleCreateGroup() {
    const name = newGroupName.trim();
    if (!name) return;
    setAddingGroup(true);
    try {
      const res = await fetch('/api/modifier-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, required: newGroupRequired, singleSelect: newGroupSingle }),
      });
      if (res.ok) {
        const group: ModifierGroup = await res.json();
        onGroupCreated(group);
        setNewGroupName('');
        setNewGroupRequired(false);
        setNewGroupSingle(true);
        setExpandedId(group.id);
      }
    } finally {
      setAddingGroup(false);
    }
  }

  async function handleToggleRequired(group: ModifierGroup) {
    const res = await fetch(`/api/modifier-groups/${group.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ required: !group.required }),
    });
    if (res.ok) onGroupUpdated(await res.json());
  }

  async function handleToggleSingle(group: ModifierGroup) {
    const res = await fetch(`/api/modifier-groups/${group.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ singleSelect: !group.singleSelect }),
    });
    if (res.ok) onGroupUpdated(await res.json());
  }

  async function handleDeleteGroup(id: string) {
    setDeletingGroup(true);
    try {
      const res = await fetch(`/api/modifier-groups/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onGroupDeleted(id);
        setDeleteGroupId(null);
        if (expandedId === id) setExpandedId(null);
      }
    } finally {
      setDeletingGroup(false);
    }
  }

  async function handleAddOption(groupId: string) {
    const state = newOptions[groupId];
    if (!state?.name?.trim()) return;
    setAddingOption((prev) => ({ ...prev, [groupId]: true }));
    try {
      const priceCents = Math.round(parseFloat(state.price || '0') * 100);
      const res = await fetch(`/api/modifier-groups/${groupId}/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: state.name.trim(), priceCents, isDefault: state.isDefault }),
      });
      if (res.ok) {
        const option: ModifierOption = await res.json();
        onOptionCreated(groupId, option);
        setNewOptions((prev) => ({ ...prev, [groupId]: { name: '', price: '', isDefault: false } }));
      }
    } finally {
      setAddingOption((prev) => ({ ...prev, [groupId]: false }));
    }
  }

  async function handleSaveOptionEdit() {
    if (!editingOption) return;
    const priceCents = Math.round(parseFloat(editingOption.price || '0') * 100);
    const res = await fetch(`/api/modifier-options/${editingOption.optionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingOption.name.trim(), priceCents }),
    });
    if (res.ok) {
      const updated: ModifierOption = await res.json();
      onOptionUpdated(editingOption.groupId, updated);
      setEditingOption(null);
    }
  }

  async function handleDeleteOption(groupId: string, optionId: string) {
    const res = await fetch(`/api/modifier-options/${optionId}`, { method: 'DELETE' });
    if (res.ok) onOptionDeleted(groupId, optionId);
  }

  const deleteGroup = deleteGroupId ? groups.find((g) => g.id === deleteGroupId) : null;

  return (
    <div className="h-full overflow-y-auto px-9 pt-7 pb-10 relative">
      {groups.length === 0 && (
        <div className="mb-6 px-6 py-5 bg-[#f5f1ea] rounded-[16px] border-[1.5px] border-sand">
          <p className="font-medium text-[14px] text-ink-muted font-grotesk leading-relaxed">
            {tr.noGroupsYet}
          </p>
        </div>
      )}

      {/* Existing groups */}
      <div className="flex flex-col gap-4 mb-6">
        {groups.map((group) => {
          const isExpanded = expandedId === group.id;
          const newOpt = newOptions[group.id] ?? { name: '', price: '', isDefault: false };

          return (
            <div key={group.id} className="bg-white border-[1.5px] border-sand rounded-[18px] overflow-hidden">
              {/* Group header */}
              <div className="flex items-center gap-3 px-5 py-4">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : group.id)}
                  className="flex-1 flex items-center gap-3 text-left bg-transparent border-none cursor-pointer p-0"
                >
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#6b4c36" strokeWidth="2.5"
                    className="flex-shrink-0 transition-transform duration-150"
                    style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  >
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-bold text-[16px] text-ink font-grotesk">{group.name}</span>
                  <span className="font-medium text-[12px] text-ink-ghost font-grotesk">
                    {group.options.length} option{group.options.length !== 1 ? 's' : ''}
                  </span>
                </button>

                {/* Required toggle */}
                <button
                  onClick={() => handleToggleRequired(group)}
                  className="h-[30px] px-[10px] rounded-[8px] border-[1.5px] cursor-pointer font-grotesk font-semibold text-[11px] tracking-[0.05em] transition-colors"
                  style={
                    group.required
                      ? { borderColor: '#1f8a5b', backgroundColor: '#e3eddc', color: '#17714a' }
                      : { borderColor: '#e0dace', backgroundColor: '#f9f6f0', color: '#6b4c36' }
                  }
                >
                  {tr.requiredToggle}
                </button>

                {/* Single/Multi toggle */}
                <button
                  onClick={() => handleToggleSingle(group)}
                  className="h-[30px] px-[10px] rounded-[8px] border-[1.5px] cursor-pointer font-grotesk font-semibold text-[11px] tracking-[0.05em] transition-colors"
                  style={
                    group.singleSelect
                      ? { borderColor: '#1a6fa0', backgroundColor: '#dce8ed', color: '#1a6fa0' }
                      : { borderColor: '#9a6c00', backgroundColor: '#fef8e8', color: '#9a6c00' }
                  }
                >
                  {group.singleSelect ? tr.singleSelectLabel : tr.multiSelectLabel}
                </button>

                {/* Delete group */}
                <button
                  onClick={() => setDeleteGroupId(group.id)}
                  className="w-[34px] h-[34px] flex items-center justify-center rounded-[9px] border-[1.5px] border-[#f0d9d2] bg-[#fbf2ef] text-red cursor-pointer hover:bg-[#f5e2db] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Expanded: options list + add form */}
              {isExpanded && (
                <div className="border-t-[1.5px] border-sand px-5 py-4 flex flex-col gap-3 bg-[#faf7f2]">
                  {group.options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-3">
                      {editingOption?.optionId === opt.id ? (
                        <>
                          <input
                            value={editingOption.name}
                            onChange={(e) => setEditingOption({ ...editingOption, name: e.target.value })}
                            className="flex-1 h-[38px] border-[1.5px] border-green rounded-[10px] px-3 font-grotesk font-semibold text-[14px] text-ink bg-white outline-none"
                          />
                          <span className="font-mono text-[13px] text-ink-muted">$</span>
                          <input
                            value={editingOption.price}
                            onChange={(e) => setEditingOption({ ...editingOption, price: e.target.value })}
                            inputMode="decimal"
                            placeholder="0.00"
                            className="w-[70px] h-[38px] border-[1.5px] border-green rounded-[10px] px-3 font-mono font-semibold text-[14px] text-ink bg-white outline-none"
                          />
                          <button
                            onClick={handleSaveOptionEdit}
                            className="h-[38px] px-4 rounded-[10px] bg-green border-none text-white font-grotesk font-bold text-[13px] cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingOption(null)}
                            className="h-[38px] px-3 rounded-[10px] border-[1.5px] border-sand bg-white font-grotesk font-semibold text-[13px] text-ink-muted cursor-pointer"
                          >
                            {tr.cancel}
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 font-semibold text-[14px] text-ink font-grotesk">{opt.name}</span>
                          {opt.isDefault && (
                            <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-ink-ghost bg-[#ede8df] px-[7px] py-[2px] rounded-[5px]">
                              {tr.defaultBadge}
                            </span>
                          )}
                          <span className="font-mono font-semibold text-[13px] text-green-dark w-[56px] text-right">
                            {money(opt.priceCents)}
                          </span>
                          <button
                            onClick={() => setEditingOption({
                              groupId: group.id, optionId: opt.id,
                              name: opt.name,
                              price: opt.priceCents === 0 ? '' : (opt.priceCents / 100).toFixed(2),
                            })}
                            className="w-[30px] h-[30px] flex items-center justify-center rounded-[8px] border-[1.5px] border-sand bg-white text-ink-muted cursor-pointer hover:bg-[#efeae0] transition-colors"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 20h4L19 9l-4-4L4 16v4z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteOption(group.id, opt.id)}
                            className="w-[30px] h-[30px] flex items-center justify-center rounded-[8px] border-[1.5px] border-[#f0d9d2] bg-[#fbf2ef] text-red cursor-pointer hover:bg-[#f5e2db] transition-colors"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add option row */}
                  <div className="flex items-center gap-2 mt-1 pt-3 border-t-[1.5px] border-[#e8e2d8]">
                    <input
                      value={newOpt.name}
                      onChange={(e) =>
                        setNewOptions((prev) => ({ ...prev, [group.id]: { ...newOpt, name: e.target.value } }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleAddOption(group.id)}
                      placeholder={tr.optionNamePlaceholder}
                      className="flex-1 h-[40px] border-[1.5px] border-sand rounded-[10px] px-3 font-grotesk font-semibold text-[14px] text-ink bg-white outline-none focus:border-green transition-colors"
                    />
                    <span className="font-mono text-[13px] text-ink-muted">$</span>
                    <input
                      value={newOpt.price}
                      onChange={(e) =>
                        setNewOptions((prev) => ({ ...prev, [group.id]: { ...newOpt, price: e.target.value } }))
                      }
                      inputMode="decimal"
                      placeholder="0.00"
                      className="w-[70px] h-[40px] border-[1.5px] border-sand rounded-[10px] px-3 font-mono font-semibold text-[14px] text-ink bg-white outline-none focus:border-green transition-colors"
                    />
                    <label className="flex items-center gap-[5px] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newOpt.isDefault}
                        onChange={(e) =>
                          setNewOptions((prev) => ({ ...prev, [group.id]: { ...newOpt, isDefault: e.target.checked } }))
                        }
                        className="w-[14px] h-[14px] cursor-pointer"
                      />
                      <span className="font-grotesk font-medium text-[11px] text-ink-muted">{tr.defaultBadge}</span>
                    </label>
                    <button
                      onClick={() => handleAddOption(group.id)}
                      disabled={addingOption[group.id] || !newOpt.name.trim()}
                      className="h-[40px] px-4 rounded-[10px] bg-green border-none text-white font-grotesk font-bold text-[13px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-transform"
                    >
                      {addingOption[group.id] ? '…' : tr.addOptionBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create new group */}
      <div className="bg-white border-[1.5px] border-sand rounded-[18px] p-5">
        <p className="font-bold text-[13px] tracking-[0.1em] uppercase text-ink-muted font-grotesk mb-4">
          {tr.newGroupBtn}
        </p>
        <div className="flex flex-col gap-3">
          <input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
            placeholder={tr.groupNamePlaceholder}
            className="h-[48px] border-[1.5px] border-sand rounded-[12px] px-4 font-grotesk font-semibold text-[15px] text-ink outline-none bg-warm-white focus:border-green focus:bg-white transition-colors"
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newGroupRequired}
                onChange={(e) => setNewGroupRequired(e.target.checked)}
                className="w-[15px] h-[15px] cursor-pointer"
              />
              <span className="font-grotesk font-semibold text-[13px] text-ink-mid">{tr.requiredToggle}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!newGroupSingle}
                onChange={(e) => setNewGroupSingle(!e.target.checked)}
                className="w-[15px] h-[15px] cursor-pointer"
              />
              <span className="font-grotesk font-semibold text-[13px] text-ink-mid">Allow multiple</span>
            </label>
            <button
              onClick={handleCreateGroup}
              disabled={addingGroup || !newGroupName.trim()}
              className="ml-auto h-[46px] px-6 rounded-[12px] bg-green border-none text-white font-grotesk font-bold text-[14px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-transform"
            >
              {addingGroup ? '…' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete group confirmation */}
      {deleteGroup && (
        <div className="absolute inset-0 bg-[rgba(31,27,23,0.5)] flex items-center justify-center z-20">
          <div
            className="w-[360px] bg-white rounded-[24px] px-8 py-8 flex flex-col gap-5"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}
          >
            <div>
              <p className="font-bold text-[20px] text-ink font-grotesk">Delete modifier group?</p>
              <p className="font-medium text-[13px] text-ink-muted font-grotesk mt-1">
                This removes all options in this group and detaches it from menu items.
              </p>
            </div>
            <div className="bg-[#f8f4ee] rounded-[12px] px-5 py-3">
              <span className="font-semibold text-[15px] text-ink font-grotesk">{deleteGroup.name}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteGroupId(null)}
                className="flex-1 h-[50px] rounded-[14px] border-[1.5px] border-sand bg-white text-ink font-grotesk font-semibold text-[15px] cursor-pointer hover:bg-[#f5f1ea] transition-colors"
              >
                {tr.cancel}
              </button>
              <button
                onClick={() => handleDeleteGroup(deleteGroup.id)}
                disabled={deletingGroup}
                className="flex-1 h-[50px] rounded-[14px] border-none bg-red text-white font-grotesk font-bold text-[15px] cursor-pointer disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {deletingGroup ? '…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
