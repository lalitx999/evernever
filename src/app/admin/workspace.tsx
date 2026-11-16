"use client";
/* eslint-disable @next/next/no-img-element -- Admin previews show freshly uploaded CMS originals without the public image cache. */
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { COMPANY, PROJECTS } from "@/data/projects";
import { SERVICE_NAVIGATION } from "@/data/navigation";
const SERVICES = SERVICE_NAVIGATION.map((s) => ({
  slug: s.slug,
  title: s.label,
}));
import type { Project } from "@/data/projects";
import type {
  AdminUser,
  ManagedProject,
  CompanySettings,
} from "@/lib/cms/types";
import styles from "./admin.module.css";
type Draft = Project & {
  id?: number;
  status: "draft" | "publish" | "trash";
  order: number;
  modified?: string;
};
const blank = (): Draft => ({
  _id: "",
  title: "",
  slug: { current: "" },
  category: "all",
  categories: [],
  categoryLabels: [],
  coverImage: "",
  gallery: [],
  videoUrls: [],
  summary: "",
  description: "",
  featured: false,
  status: "draft",
  order: 0,
});
async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, {
    method,
    ...(body instanceof FormData
      ? { body }
      : body === undefined
        ? {}
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"
        : data.message || "ดำเนินการไม่สำเร็จ",
    );
  return data;
}
export function AdminWorkspace({
  user,
  liveContent,
}: {
  user: AdminUser;
  liveContent: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState<ManagedProject[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"projects" | "company" | "import">("projects");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [companyLoaded, setCompanyLoaded] = useState(false);
  const [company, setCompany] = useState<CompanySettings>({});
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api<ManagedProject[]>("projects"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    api<ManagedProject[]>("projects")
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const act = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ดำเนินการไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };
  const leave = () =>
    !dirty ||
    window.confirm("มีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากการแก้ไขหรือไม่?");
  const open = (item: Draft) => {
    if (!leave()) return;
    setDraft(structuredClone(item));
    setDirty(false);
    setPreview(false);
    setMessage("");
    setError("");
  };
  const change = (patch: Partial<Draft>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
    setDirty(true);
  };
  const upload = async (files: FileList | null, cover: boolean) => {
    if (!files?.length) return;
    await act(async () => {
      for (const file of Array.from(files)) {
        if (file.size > 3 * 1024 * 1024)
          throw new Error("แต่ละรูปต้องไม่เกิน 3 MB");
        const form = new FormData();
        form.set("file", file);
        const data = await api<{ url: string }>("media", "POST", form);
        setDraft((current) =>
          current
            ? {
                ...current,
                ...(cover
                  ? { coverImage: data.url }
                  : { gallery: [...(current.gallery || []), data.url] }),
              }
            : current,
        );
        setDirty(true);
      }
      setMessage("อัปโหลดแล้ว กดบันทึกเพื่อเพิ่มรูปในผลงาน");
    });
  };
  const save = async () => {
    if (!draft) return;
    await act(async () => {
      const result = await api<ManagedProject>(
        draft.id ? `projects/${draft.id}` : "projects",
        "POST",
        draft,
      );
      setDraft(result);
      setDirty(false);
      await load();
      setMessage(
        result.status === "publish"
          ? "เผยแพร่ผลงานสำเร็จ"
          : draft.status === "draft" && items.some((p) => p.id === result.id && p.status === "publish")
            ? "ถอนเผยแพร่แล้ว ผลงานนี้เก็บเป็นฉบับร่างและไม่แสดงบนหน้าเว็บ"
            : "บันทึกฉบับร่างแล้ว",
      );
    });
  };
  const switchTab = async (next: typeof tab) => {
    if (!leave()) return;
    setDraft(null);
    setDirty(false);
    setTab(next);
    setMessage("");
    if (next === "company") {
      setCompanyLoaded(false);
      await act(async () => {
        setCompany({ ...COMPANY, ...(await api<CompanySettings>("company")) });
        setCompanyLoaded(true);
      });
    }
  };
  return (
    <div className={styles.workspace}>
      {!liveContent && (
        <p className={styles.notice}>
          กำลังเตรียมข้อมูลหลังบ้าน — หน้าเว็บไซต์ยังใช้ผลงานชุดเดิม
          การบันทึกที่นี่จะยังไม่เปลี่ยนเนื้อหาหน้าเว็บจนกว่าจะเปิดใช้ข้อมูล
          WordPress
        </p>
      )}
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>EVERNEVER / WORKSPACE</span>
          <h1>Your stories, managed.</h1>
          <p>สวัสดี {user.name} · จัดการผลงานและเนื้อหาเว็บไซต์</p>
        </div>
        <div className={styles.actions}>
          <a href="/" target="_blank" rel="noreferrer">
            ดูเว็บไซต์ ↗
          </a>
          <button
            disabled={busy}
            className={styles.secondary}
            onClick={() => {
              if (leave())
                void act(async () => {
                  await api("logout", "POST", {});
                  router.replace("/login");
                  router.refresh();
                });
            }}
          >
            ออกจากระบบ
          </button>
        </div>
      </header>
      <nav className={styles.tabs} aria-label="เมนูหลังบ้าน">
        <button
          disabled={busy}
          aria-current={tab === "projects" ? "page" : undefined}
          onClick={() => void switchTab("projects")}
        >
          ผลงาน{" "}
          <small>{items.filter((p) => p.status !== "trash").length}</small>
        </button>
        {user.canManageSettings && (
          <button
            disabled={busy}
            aria-current={tab === "company" ? "page" : undefined}
            onClick={() => void switchTab("company")}
          >
            ข้อมูลบริษัท
          </button>
        )}
        <button
          disabled={busy}
          aria-current={tab === "import" ? "page" : undefined}
          onClick={() => void switchTab("import")}
        >
          นำเข้าผลงานเดิม
        </button>
      </nav>
      {error && (
        <div role="alert" className={styles.error}>
          {error} <a href="/login">เข้าสู่ระบบ</a>
        </div>
      )}
      {message && (
        <div role="status" className={styles.notice}>
          {message}
          {liveContent && draft?.status === "publish" && !dirty && (
            <> · <a href={`/works/${encodeURIComponent(draft.slug.current)}`} target="_blank" rel="noreferrer">ดูผลงานบนเว็บไซต์ ↗</a></>
          )}
        </div>
      )}
      {tab === "projects" && !draft && (
        <>
          <p>เลือกงานที่จะแสดงบนเว็บไซต์ได้จาก “แก้ไขผลงาน” → สถานะ: เผยแพร่ = แสดงบนเว็บ · ฉบับร่าง = ซ่อนไว้โดยไม่ลบข้อมูล</p>
          <div className={styles.toolbar}>
            <input
              aria-label="ค้นหาผลงาน"
              placeholder="ค้นหาชื่อผลงาน…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              aria-label="สถานะผลงาน"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">ผลงานทั้งหมด</option>
              <option value="publish">เผยแพร่แล้ว</option>
              <option value="draft">ฉบับร่าง · ซ่อนจากเว็บ</option>
              <option value="trash">ถังขยะ</option>
            </select>
            <button disabled={busy || loading} onClick={() => open(blank())}>
              + เพิ่มผลงาน
            </button>
            <button
              className={styles.secondary}
              disabled={busy}
              onClick={() => void load()}
            >
              โหลดใหม่
            </button>
          </div>
          {loading ? (
            <p>กำลังโหลดผลงาน…</p>
          ) : (
            <div className={styles.grid}>
              {items
                .filter(
                  (p) =>
                    p.title.toLowerCase().includes(query.toLowerCase()) &&
                    (filter === "all"
                      ? p.status !== "trash"
                      : p.status === filter),
                )
                .map((p) => (
                  <article className={styles.card} key={p.id}>
                    {p.coverImage ? (
                      <img src={p.coverImage} alt="" />
                    ) : (
                      <div className={styles.placeholder}>ยังไม่มีรูปปก</div>
                    )}
                    <div>
                      <span className={styles.meta}>
                        {p.status === "publish"
                          ? "เผยแพร่แล้ว · แสดงบนเว็บ"
                          : p.status === "trash"
                            ? "ถังขยะ"
                            : "ฉบับร่าง · ซ่อนจากเว็บ"}{" "}
                        · ลำดับ {p.order}
                        {p.featured ? " · FEATURED" : ""}
                      </span>
                      <h2>{p.title}</h2>
                      <p>{p.categoryLabels?.join(" / ")}</p>
                      <button
                        className={styles.secondary}
                        disabled={busy}
                        onClick={() => open(p)}
                      >
                        {p.status === "trash"
                          ? "เปิดเพื่อกู้คืน"
                          : "แก้ไขผลงาน →"}
                      </button>
                      {liveContent && p.status === "publish" && (
                        <p><a href={`/works/${encodeURIComponent(p.slug.current)}`} target="_blank" rel="noreferrer">ดูผลงานบนเว็บไซต์ ↗</a></p>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          )}
          {!loading && !items.length && (
            <div className={styles.empty}>
              <h2>เริ่มต้นเรื่องราวชิ้นแรก</h2>
              <p>
                เพิ่มผลงานใหม่
                หรือนำเข้าผลงานที่อยู่ในเว็บปัจจุบันเป็นฉบับร่างเพื่อตรวจสอบ
              </p>
            </div>
          )}
        </>
      )}
      {tab === "projects" && draft && (
        <>
          <div className={styles.toolbar}>
            <button
              className={styles.secondary}
              disabled={busy}
              onClick={() => {
                if (leave()) {
                  setDraft(null);
                  setDirty(false);
                }
              }}
            >
              ← รายการผลงาน
            </button>
            <h2>{draft.id ? "แก้ไขผลงาน" : "เพิ่มผลงาน"}</h2>
            <button
              className={styles.secondary}
              onClick={() => setPreview(!preview)}
            >
              {preview ? "กลับไปแก้ไข" : "ดูตัวอย่าง"}
            </button>
          </div>
          {preview ? (
            <article className={styles.preview}>
              <p>ตัวอย่างข้อมูลที่ยังไม่บันทึก</p>
              <h1>{draft.title}</h1>
              <p>{draft.categoryLabels?.join(" / ")}</p>
              {draft.coverImage && (
                <img src={draft.coverImage} alt={draft.title} />
              )}
              <p>{draft.description}</p>
              {draft.content?.map((b, i) =>
                b.kind === "heading" ? (
                  <h2 key={i}>{b.text}</h2>
                ) : (
                  <p key={i}>{b.text}</p>
                ),
              )}
              {draft.videoUrls?.map((url) => (
                <p key={url}>
                  <a href={url} target="_blank" rel="noreferrer">
                    ดูวิดีโอ ↗
                  </a>
                </p>
              ))}
              {draft.gallery?.map((url, i) => (
                <img src={url} alt={`ภาพที่ ${i + 1}`} key={`${url}-${i}`} />
              ))}
            </article>
          ) : (
            <form
              className={styles.editor}
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              <fieldset disabled={busy}>
                <div className={styles.editorColumns}>
                  <section className={styles.panel}>
                    <h2>รายละเอียดผลงาน</h2>
                    <label>
                      ชื่อผลงาน
                      <input
                        required
                        maxLength={200}
                        value={draft.title}
                        onChange={(e) => change({ title: e.target.value })}
                      />
                    </label>
                    <label>
                      ลิงก์หน้า (slug)
                      <input
                        required
                        value={draft.slug.current}
                        onChange={(e) =>
                          change({ slug: { current: e.target.value } })
                        }
                      />
                      <small>/works/{draft.slug.current || "ชื่อผลงาน"}</small>
                    </label>
                    <label>
                      คำอธิบายสั้น
                      <textarea
                        maxLength={500}
                        rows={3}
                        value={draft.summary || ""}
                        onChange={(e) => change({ summary: e.target.value })}
                      />
                    </label>
                    <label>
                      รายละเอียด
                      <textarea
                        maxLength={40000}
                        disabled={!!draft.content?.length}
                        rows={7}
                        value={draft.description || ""}
                        onChange={(e) =>
                          change({ description: e.target.value })
                        }
                      />
                    </label>
                    {!!draft.content?.length && (
                      <div>
                        <h3>เนื้อหาเดิม</h3>
                        <p>
                          เว็บจะแสดงหัวข้อและย่อหน้าเหล่านี้แทนช่องรายละเอียด
                        </p>
                        <button
                          type="button"
                          className={styles.secondary}
                          onClick={() =>
                            change({
                              description: draft.content
                                ?.map((b) => b.text)
                                .join("\n\n"),
                              content: [],
                            })
                          }
                        >
                          รวมเป็นช่องรายละเอียดเดียว
                        </button>
                        {draft.content.map((block, i) => (
                          <label key={i}>
                            {block.kind === "heading" ? "หัวข้อ" : "ย่อหน้า"}{" "}
                            {i + 1}
                            <textarea
                              rows={3}
                              value={block.text}
                              onChange={(e) =>
                                change({
                                  content: draft.content!.map((b, j) =>
                                    j === i
                                      ? { ...b, text: e.target.value }
                                      : b,
                                  ),
                                })
                              }
                            />
                          </label>
                        ))}
                      </div>
                    )}
                    <label>
                      ลิงก์วิดีโอ (หนึ่งลิงก์ต่อบรรทัด)
                      <textarea
                        rows={3}
                        value={draft.videoUrls?.join("\n") || ""}
                        onChange={(e) =>
                          change({ videoUrls: e.target.value.split("\n") })
                        }
                      />
                    </label>
                    <h3>หมวดหมู่</h3>
                    <div className={styles.checks}>
                      {SERVICES.map((s) => (
                        <label key={s.slug}>
                          <input
                            type="checkbox"
                            checked={
                              draft.categories?.includes(s.slug) || false
                            }
                            onChange={(e) => {
                              const cats = e.target.checked
                                ? [...(draft.categories || []), s.slug]
                                : (draft.categories || []).filter(
                                    (c) => c !== s.slug,
                                  );
                              change({
                                categories: cats,
                                category: cats[0] || "all",
                                categoryLabels: cats.map(
                                  (c) =>
                                    SERVICES.find((x) => x.slug === c)?.title ||
                                    c,
                                ),
                              });
                            }}
                          />
                          {s.title}
                        </label>
                      ))}
                    </div>
                  </section>
                  <aside className={styles.panel}>
                    <h2>การเผยแพร่</h2>
                    <label>
                      สถานะ
                      <select
                        value={draft.status}
                        onChange={(e) =>
                          change({ status: e.target.value as Draft["status"] })
                        }
                      >
                        {draft.status === "trash" && (
                          <option value="trash">
                            ถังขยะ — เลือกสถานะเพื่อกู้คืน
                          </option>
                        )}
                        <option value="draft">ฉบับร่าง · ซ่อนจากเว็บ</option>
                        <option value="publish">เผยแพร่ · แสดงบนเว็บ</option>
                      </select>
                    </label>
                    <label>
                      ลำดับ (น้อยแสดงก่อน)
                      <input
                        type="number"
                        min={0}
                        max={99999}
                        value={draft.order}
                        onChange={(e) =>
                          change({ order: Number(e.target.value) })
                        }
                      />
                    </label>
                    <label className={styles.check}>
                      <input
                        type="checkbox"
                        checked={!!draft.featured}
                        onChange={(e) => change({ featured: e.target.checked })}
                      />
                      แนะนำบนหน้าแรก
                    </label>
                    <h3>รูปปก</h3>
                    {draft.coverImage && (
                      <img
                        className={styles.cover}
                        src={draft.coverImage}
                        alt="รูปปก"
                      />
                    )}
                    <label>
                      อัปโหลดรูปปก
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => void upload(e.target.files, true)}
                      />
                    </label>
                    <label>
                      หรือ URL รูปปก
                      <input
                        value={draft.coverImage}
                        onChange={(e) => change({ coverImage: e.target.value })}
                      />
                    </label>
                    <small>JPG / PNG / WebP ไม่เกิน 3 MB ต่อรูป</small>
                    <h3>แกลเลอรี</h3>
                    <label>
                      เพิ่มรูปหลายรูป
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => void upload(e.target.files, false)}
                      />
                    </label>
                    <div className={styles.gallery}>
                      {draft.gallery?.map((url, i) => (
                        <div key={`${url}-${i}`}>
                          <img src={url} alt={`ภาพที่ ${i + 1}`} />
                          <button
                            type="button"
                            className={styles.secondary}
                            onClick={() =>
                              change({
                                gallery: draft.gallery!.filter(
                                  (_, j) => j !== i,
                                ),
                              })
                            }
                          >
                            นำออก
                          </button>
                          {i > 0 && (
                            <button
                              type="button"
                              className={styles.secondary}
                              onClick={() => {
                                const g = [...draft.gallery!];
                                [g[i - 1], g[i]] = [g[i], g[i - 1]];
                                change({ gallery: g });
                              }}
                            >
                              เลื่อนขึ้น
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button disabled={draft.status === "trash"} type="submit">
                      {busy
                        ? "กำลังบันทึก…"
                        : draft.status === "publish"
                          ? "บันทึกและเผยแพร่"
                          : "บันทึกฉบับร่าง"}
                    </button>
                    {draft.id && draft.status !== "trash" && (
                      <button
                        type="button"
                        className={styles.danger}
                        onClick={() => {
                          if (
                            window.confirm(
                              "ย้ายผลงานนี้ลงถังขยะ? สามารถกู้คืนได้ภายหลัง",
                            )
                          )
                            void act(async () => {
                              await api(`projects/${draft.id}`, "DELETE");
                              setDraft(null);
                              setDirty(false);
                              await load();
                              setMessage("ย้ายลงถังขยะแล้ว");
                            });
                        }}
                      >
                        ย้ายลงถังขยะ
                      </button>
                    )}
                  </aside>
                </div>
              </fieldset>
            </form>
          )}
        </>
      )}
      {tab === "company" && user.canManageSettings && (
        <form
          className={`${styles.form} ${styles.panel}`}
          onSubmit={(e) => {
            e.preventDefault();
            void act(async () => {
              await api("company", "POST", company);
              setDirty(false);
              setMessage("บันทึกข้อมูลบริษัทแล้ว");
            });
          }}
        >
          <h2>ข้อมูลบริษัท</h2>
          <fieldset disabled={busy || !companyLoaded}>
            {Object.entries({
              thaiDescription: "แนะนำบริษัทภาษาไทย",
              aboutHeading: "หัวข้อแนะนำบริษัท",
              about: "รายละเอียดบริษัท",
              invitation: "ข้อความเชิญชวน",
              legalName: "ชื่อบริษัท",
              address: "ที่อยู่",
              hours: "เวลาทำการ",
              email: "อีเมลติดต่อ",
            }).map(([key, label]) => (
              <label key={key}>
                {label}
                <textarea
                  required
                  value={company[key as keyof CompanySettings] || ""}
                  onChange={(e) => {
                    setCompany({ ...company, [key]: e.target.value });
                    setDirty(true);
                  }}
                />
              </label>
            ))}
            <button disabled={busy || !companyLoaded}>
              บันทึกข้อมูลบริษัท
            </button>
          </fieldset>
        </form>
      )}
      {tab === "import" && (
        <section className={styles.panel}>
          <h2>นำเข้าผลงานจากเว็บปัจจุบัน</h2>
          <p>
            สร้างเป็นฉบับร่างในชุดข้อมูลใหม่ ไม่แก้โพสต์ Elementor เดิม
            ตรวจรูปและเนื้อหาก่อนเผยแพร่
            รายการนี้เป็นข้อมูลที่นำเข้าไว้ในโปรเจกต์แล้ว ({PROJECTS.length}{" "}
            ชิ้น) ไม่ใช่การดึง WordPress ล่าสุด
          </p>
          {PROJECTS.map((p, i) => {
            const exists = items.some(
              (item) => item.slug.current === p.slug.current,
            );
            return (
              <div className={styles.importRow} key={p._id}>
                <span>{p.title}</span>
                <button
                  className={styles.secondary}
                  disabled={busy || exists}
                  onClick={() =>
                    void act(async () => {
                      await api("projects", "POST", {
                        ...p,
                        status: "draft",
                        order: i,
                      });
                      await load();
                      setMessage(`นำเข้า ${p.title} เป็นฉบับร่างแล้ว`);
                    })
                  }
                >
                  {exists ? "นำเข้าแล้ว" : "นำเข้าเป็นฉบับร่าง"}
                </button>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
