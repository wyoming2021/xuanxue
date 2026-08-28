"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDeviceId } from "@/lib/device";
import { Calendar, User, Clock } from "lucide-react";

const SHI_CHEN_OPTIONS = [
  { value: "子时", label: "子时 (23:00-01:00)" },
  { value: "丑时", label: "丑时 (01:00-03:00)" },
  { value: "寅时", label: "寅时 (03:00-05:00)" },
  { value: "卯时", label: "卯时 (05:00-07:00)" },
  { value: "辰时", label: "辰时 (07:00-09:00)" },
  { value: "巳时", label: "巳时 (09:00-11:00)" },
  { value: "午时", label: "午时 (11:00-13:00)" },
  { value: "未时", label: "未时 (13:00-15:00)" },
  { value: "申时", label: "申时 (15:00-17:00)" },
  { value: "酉时", label: "酉时 (17:00-19:00)" },
  { value: "戌时", label: "戌时 (19:00-21:00)" },
  { value: "亥时", label: "亥时 (21:00-23:00)" },
];

export default function BaziPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    gender: "" as "male" | "female" | "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.birthDate || !form.birthTime || !form.gender) return;
    setLoading(true);

    try {
      const res = await fetch("/api/bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name || "某人",
          birthDate: form.birthDate,
          birthTime: form.birthTime,
          gender: form.gender,
          deviceId: getDeviceId(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/bazi/result/${data.data.recordId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 page-transition">
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl text-brand-gold">八字排盘</CardTitle>
          <p className="text-sm text-brand-muted">输入您的出生信息，解读命理格局</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User size={14} /> 姓名 <span className="text-brand-muted">(可选)</span>
              </Label>
              <Input
                id="name"
                placeholder='默认"某人"'
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="border-white/10 bg-white/5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate" className="flex items-center gap-2">
                <Calendar size={14} /> 出生日期
              </Label>
              <Input
                id="birthDate"
                type="date"
                required
                value={form.birthDate}
                onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
                className="border-white/10 bg-white/5"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock size={14} /> 出生时辰
              </Label>
              <select
                required
                value={form.birthTime}
                onChange={(e) => setForm((f) => ({ ...f, birthTime: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100"
              >
                <option value="">请选择时辰</option>
                {SHI_CHEN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>性别</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={form.gender === "male" ? "default" : "outline"}
                  onClick={() => setForm((f) => ({ ...f, gender: "male" }))}
                  className="flex-1"
                >
                  男
                </Button>
                <Button
                  type="button"
                  variant={form.gender === "female" ? "default" : "outline"}
                  onClick={() => setForm((f) => ({ ...f, gender: "female" }))}
                  className="flex-1"
                >
                  女
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !form.birthDate || !form.birthTime || !form.gender}
              className="w-full bg-brand-gold text-black hover:bg-brand-gold-light"
            >
              {loading ? "排盘中..." : "开始排盘"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
