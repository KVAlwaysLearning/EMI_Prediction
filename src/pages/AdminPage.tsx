import React, { useState, useEffect } from 'react';
import { StoredRecord } from '../types';
import { getRecords, createRecord, updateRecord, deleteRecord, getHealth, ApiError } from '../lib/api';
import { Database, Plus, Trash2, Edit3, Check, X, RefreshCw, Cpu, Cloud, ExternalLink, Key, Lock, Unlock, AlertCircle } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [records, setRecords] = useState<StoredRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [health, setHealth] = useState<any>(null);

  const [newApplicantName, setNewApplicantName] = useState('');
  const [newSalary, setNewSalary] = useState(60000);
  const [newCreditScore, setNewCreditScore] = useState(740);
  const [newScenario, setNewScenario] = useState('Personal Loan');
  const [newAmount, setNewAmount] = useState(200000);
  const [newTenure, setNewTenure] = useState(24);

  // Load health info regardless of auth
  useEffect(() => {
    getHealth()
      .then((res) => setHealth(res))
      .catch(() => setHealth({ status: 'ok', active_engine: 'rule_based' }));
  }, []);

  const fetchRecordsWithToken = async (authToken: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await getRecords(authToken);
      setRecords(data);
      setToken(authToken);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null);
        setAuthError('Authentication failed: Invalid or missing Admin Bearer Token.');
      } else {
        console.error('Failed to load admin records:', err);
        setAuthError(err.message || 'Failed to fetch records.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    fetchRecordsWithToken(inputToken.trim());
  };

  const handleLogout = () => {
    setToken(null);
    setRecords([]);
    setInputToken('');
    setAuthError(null);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this prediction record?')) return;
    try {
      await deleteRecord(id, token);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null);
        setAuthError('Session expired or unauthorized. Please re-authenticate.');
      } else {
        console.error('Failed to delete record:', err);
      }
    }
  };

  const handleStartEdit = (rec: StoredRecord) => {
    setEditingId(rec.id);
    setEditName(rec.applicant_name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!token) return;
    try {
      const updated = await updateRecord(id, { applicant_name: editName }, token);
      setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setEditingId(null);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null);
        setAuthError('Session expired or unauthorized. Please re-authenticate.');
      } else {
        console.error('Failed to update record:', err);
      }
    }
  };

  const handleAddManualRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const created = await createRecord({
        applicant_name: newApplicantName || 'Manual Record',
        monthly_salary: newSalary,
        credit_score: newCreditScore,
        emi_scenario: newScenario as any,
        requested_amount: newAmount,
        requested_tenure: newTenure,
      }, token);
      setRecords((prev) => [created, ...prev]);
      setShowAddModal(false);
      setNewApplicantName('');
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null);
        setAuthError('Session expired or unauthorized. Please re-authenticate.');
      } else {
        console.error('Failed to create record:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>ADMINISTRATION & ML OPS CONSOLE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase">
            Stored Loan Records & DagsHub Integration
          </h1>
          <p className="text-slate-400">Monitor model inference architecture, configure remote DagsHub MLflow tracking, and manage stored underwriter records.</p>
        </div>

        <div className="flex items-center gap-3">
          {token && (
            <>
              <button
                onClick={() => fetchRecordsWithToken(token)}
                className="p-2.5 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-300 transition-all cursor-pointer"
                title="Refresh Records"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Manual Record</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-2.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer font-bold"
                title="Lock Admin Access"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Console</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* DagsHub Setup Guide & Inference Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: DagsHub Setup Guide */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase">DagsHub Remote MLflow Tracking Setup</h3>
            </div>
            <a
              href="https://dagshub.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
            >
              <span>Open DagsHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-slate-300 leading-relaxed font-sans text-xs">
            EMIPredict AI is configured to log all classification and regression experiments directly to a hosted DagsHub MLflow server. Follow these 5 steps to connect Google Colab:
          </p>

          <ol className="space-y-2.5 text-[11px] font-sans text-slate-300">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-[10px]">1</span>
              <span>Create a free account at <strong className="text-white">dagshub.com</strong> and click <strong className="text-white">Create New Repo</strong> named <code className="text-emerald-400 bg-[#0b1329] px-1 py-0.5 rounded font-mono">emipredict-ai</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-[10px]">2</span>
              <span>Under repository header, click <strong className="text-white">Go to MLflow UI</strong> and copy the remote tracking URI: <code className="text-emerald-400 bg-[#0b1329] px-1 py-0.5 rounded font-mono">https://dagshub.com/&lt;user&gt;/emipredict-ai.mlflow</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-[10px]">3</span>
              <span>Go to <strong className="text-white">DagsHub Settings &gt; Tokens</strong> and generate a Personal Access Token with read/write access.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-[10px]">4</span>
              <span>In Google Colab, add Secrets: <code className="text-amber-400 bg-[#0b1329] px-1 py-0.5 rounded font-mono">DAGSHUB_MLFLOW_URI</code>, <code className="text-amber-400 bg-[#0b1329] px-1 py-0.5 rounded font-mono">DAGSHUB_USERNAME</code>, and <code className="text-amber-400 bg-[#0b1329] px-1 py-0.5 rounded font-mono">DAGSHUB_TOKEN</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-[10px]">5</span>
              <span>Execute notebooks 04-06. The runs and registered Production models will stream automatically to DagsHub.</span>
            </li>
          </ol>
        </div>

        {/* Right Col: Inference Engine Status */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1e293b] pb-3">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase">Inference Engine Status</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded bg-[#0b1329] border border-[#1e293b] flex items-center justify-between">
              <span className="text-slate-400">Active Engine:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                {health?.active_engine || 'rule_based'}
              </span>
            </div>

            <div className="p-3 rounded bg-[#0b1329] border border-[#1e293b] flex items-center justify-between">
              <span className="text-slate-400">ONNX Model Runtime:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${health?.onnx_available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                {health?.onnx_available ? 'Ready (Zero-Python)' : 'Awaiting Colab Export'}
              </span>
            </div>

            <div className="p-3 rounded bg-[#0b1329] border border-[#1e293b] flex items-center justify-between">
              <span className="text-slate-400">Python Scikit/XGBoost:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${health?.python_models_trained ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                {health?.python_models_trained ? 'Trained (.pkl)' : 'Pending Colab Run'}
              </span>
            </div>

            <div className="p-3 rounded bg-[#0b1329] border border-[#1e293b] flex items-center justify-between">
              <span className="text-slate-400">Feature Vector Space:</span>
              <span className="text-white font-bold">48 Features (v3.0)</span>
            </div>
          </div>
        </div>
      </div>

      {/* D6: Admin Authentication Gate */}
      {!token ? (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-8 max-w-lg mx-auto shadow-2xl space-y-5 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
              Underwriter Admin Authorization
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Enter the bearer secret token (<code className="text-emerald-400 font-mono">ADMIN_TOKEN</code>) to view and manage stored applicant records.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-slate-400 text-xs font-bold mb-1.5 uppercase">
                Admin Token Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="Enter secret ADMIN_TOKEN"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0b1329] border border-[#334155] rounded-lg text-white font-mono text-xs outline-none focus:border-emerald-500"
                  required
                />
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.25)]"
            >
              <Unlock className="w-4 h-4" />
              <span>{loading ? 'Verifying Authorization...' : 'Unlock Admin Database'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* Authenticated Records Table */
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#1e293b] flex items-center justify-between bg-[#0b1329]">
            <div className="flex items-center gap-2">
              <Unlock className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white uppercase text-xs">Stored Applicant Risk Records ({records.length})</h3>
            </div>
            <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Authenticated Session
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] text-slate-400 bg-[#0b1329] text-[11px]">
                  <th className="p-3">Record ID</th>
                  <th className="p-3">Applicant Name</th>
                  <th className="p-3">Monthly Salary</th>
                  <th className="p-3">Credit Score</th>
                  <th className="p-3">Company Type</th>
                  <th className="p-3">Scenario</th>
                  <th className="p-3">Requested Loan</th>
                  <th className="p-3">Prediction Result</th>
                  <th className="p-3">Max EMI (INR)</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#1e293b]/40 text-slate-300 transition-colors">
                    <td className="p-3 font-bold text-slate-400">{rec.id}</td>
                    <td className="p-3">
                      {editingId === rec.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-[#0b1329] border border-[#334155] p-1 rounded text-white text-xs outline-none"
                          />
                          <button onClick={() => handleSaveEdit(rec.id)} className="text-emerald-400 p-1">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-slate-500 p-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-semibold text-white">{rec.applicant_name}</span>
                      )}
                    </td>
                    <td className="p-3">₹{rec.monthly_salary.toLocaleString()}</td>
                    <td className="p-3">{rec.credit_score}</td>
                    <td className="p-3 text-slate-300">{rec.company_type || 'MNC'}</td>
                    <td className="p-3 text-slate-400">{rec.emi_scenario}</td>
                    <td className="p-3">₹{rec.requested_amount.toLocaleString()} ({rec.requested_tenure}m)</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.prediction_result === 'Eligible'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : rec.prediction_result === 'High_Risk'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {rec.prediction_result}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">₹{rec.max_recommended_emi.toLocaleString()}</td>
                    <td className="p-3 flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(rec)}
                        className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Edit Name"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500 font-mono">
                      No stored prediction records found. Click &quot;Add Manual Record&quot; to insert one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for adding record */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-sm text-white uppercase">Add New Loan Applicant Record</h3>
            <form onSubmit={handleAddManualRecord} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Applicant Name</label>
                <input
                  type="text"
                  required
                  value={newApplicantName}
                  onChange={(e) => setNewApplicantName(e.target.value)}
                  className="w-full p-2 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none"
                  placeholder="e.g. Anish Patel"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Monthly Salary</label>
                  <input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(Number(e.target.value))}
                    className="w-full p-2 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Credit Score</label>
                  <input
                    type="number"
                    value={newCreditScore}
                    onChange={(e) => setNewCreditScore(Number(e.target.value))}
                    className="w-full p-2 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Requested Amount</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full p-2 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tenure (Months)</label>
                  <input
                    type="number"
                    value={newTenure}
                    onChange={(e) => setNewTenure(Number(e.target.value))}
                    className="w-full p-2 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-[#1e293b] text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-500 text-slate-950 font-extrabold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
