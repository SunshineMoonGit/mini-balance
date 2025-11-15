import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // TODO: API 연결
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setError("");
    console.log("login", { email, password });
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white">
            M
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">미니 장부 로그인</h1>
          <p className="text-sm text-slate-500">내 장부 데이터를 안전하게 관리하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-600">
            이메일
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm"
              placeholder="ceo@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            비밀번호
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button type="submit" className="w-full rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
            로그인
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <Link to="/forgot">비밀번호 찾기</Link>
          <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
