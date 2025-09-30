import React, { useEffect, useState } from "react";

interface LinksSectionProps {
  entityType: "recording" | "event" | "song" | "venue";
  entityId: number;
  readonly?: boolean;
}

interface LinkType {
  id: number;
  name: string;
}

interface Link {
  id: number;
  url: string;
  title?: string;
  linkTypeId: number;
  linkTypeName: string;
  description?: string;
  isActive: boolean;
}

const LinksSection: React.FC<LinksSectionProps> = ({ entityType, entityId, readonly }) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [linkTypes, setLinkTypes] = useState<LinkType[]>([]);
  const [form, setForm] = useState({
    id: null as number | null,
    url: "",
    title: "",
    linkTypeId: "",
    description: "",
    isActive: true,
  });
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Fetch links for entity
  useEffect(() => {
    async function fetchLinks() {
      setLoading(true);
      try {
        const res = await fetch(`/api/links/${entityType}/${entityId}`);
        if (res.ok) {
          const data = await res.json();
          setLinks(data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();
  }, [entityType, entityId]);

  // Fetch link types
  useEffect(() => {
    async function fetchLinkTypes() {
      const res = await fetch("/api/link-types");
      if (res.ok) {
        setLinkTypes(await res.json());
      }
    }
    fetchLinkTypes();
  }, []);

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!form.url) newErrors.url = "URL is required";
    if (!form.linkTypeId) newErrors.linkTypeId = "Link type is required";
    return newErrors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    let fieldValue: string | boolean = value;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      fieldValue = e.target.checked;
    }
    setForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  }

  function handleAdd() {
    setForm({ id: null, url: "", title: "", linkTypeId: "", description: "", isActive: true });
    setErrors({});
    setShowForm(true);
  }

  async function handleDeleteForm(id: number) {
  if (!window.confirm("Delete this link?")) return;
  await fetch(`/api/links/${entityType}/${id}`, { method: "DELETE" });
  setLinks((prev) => prev.filter((l) => l.id !== id));
  setShowForm(false);
  }

  function handleEdit(link: Link) {
    setForm({
      id: link.id,
      url: link.url,
      title: link.title || "",
      linkTypeId: String(link.linkTypeId),
      description: link.description || "",
      isActive: link.isActive,
    });
    setErrors({});
    setShowForm(true);
  }

  async function handleDelete(id: number) {
  if (!window.confirm("Delete this link?")) return;
  await fetch(`/api/links/${entityType}/${id}`, { method: "DELETE" });
  setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    const payload = {
      url: form.url,
      title: form.title,
      linkTypeId: Number(form.linkTypeId),
      description: form.description,
      isActive: form.isActive,
      entityType,
      entityId,
    };
    let res;
    if (form.id) {
      res = await fetch(`/api/links/${entityType}/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`/api/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    if (res.ok) {
      setShowForm(false);
      setForm({ id: null, url: "", title: "", linkTypeId: "", description: "", isActive: true });
      // Refresh links
      const updated = await fetch(`/api/links/${entityType}/${entityId}`);
      setLinks(updated.ok ? await updated.json() : links);
    } else {
      setErrors({ form: "Save failed" });
    }
  }

  // Minimal rendering for embedding under recordings
  if (links.length === 0 && !showForm) {
    return (
      <div className="flex justify-end">
        {!readonly && (
          <button
            className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded hover:bg-blue-200 border border-blue-200 mr-1"
            onClick={handleAdd}
            type="button"
          >
            Add Link
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="mt-2">
      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link) => (
            <div key={link.id} className={`flex flex-col rounded border p-2 mb-2 ${link.isActive ? '' : 'bg-red-50'}`}>
              <div className="flex items-center gap-4">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                  {link.url}
                </a>
                <span className="text-sm text-gray-700">{link.title}</span>
                <span className="text-xs text-gray-500">{link.linkTypeName}</span>
                <span className="text-sm">{link.isActive ? "✅" : "❌"}</span>
                {!readonly && (
                  <>
                    <button
                      className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded hover:bg-blue-200 border border-blue-200 mr-1"
                      onClick={() => handleEdit(link)}
                      type="button"
                    >Edit</button>
                    <button
                      className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded hover:bg-red-200 border border-red-200"
                      onClick={() => handleDelete(link.id)}
                      type="button"
                    >Delete</button>
                  </>
                )}
              </div>
              {link.description && (
                <div className="text-gray-600 text-xs mt-1 ml-2">{link.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
      {!readonly && links.length > 0 && (
        <div className="flex justify-end mb-2">
          <button
            className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded hover:bg-blue-200 border border-blue-200 mr-1"
            onClick={handleAdd}
            type="button"
          >
            Add Link
          </button>
        </div>
      )}
      {showForm && (
        <form className="mt-2 p-4 border rounded bg-gray-50" onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-2">
            <div className="w-1/3">
              <label className="block font-medium">URL *</label>
              <input
                type="text"
                name="url"
                value={form.url}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
                required
              />
              {errors.url && <div className="text-red-500 text-sm">{errors.url}</div>}
            </div>
            <div className="w-1/3">
              <label className="block font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="w-1/3">
              <label className="block font-medium">Link Type *</label>
              <select
                name="linkTypeId"
                value={form.linkTypeId}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
                required
              >
                <option value="">Select type...</option>
                {linkTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>
              {errors.linkTypeId && <div className="text-red-500 text-sm">{errors.linkTypeId}</div>}
            </div>
          </div>
          <div className="mb-2">
            <label className="block font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              rows={2}
            />
          </div>
          <div className="mb-2 flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="font-medium">Active</label>
          </div>
          {errors.form && <div className="text-red-500 text-sm mb-2">{errors.form}</div>}
          <div className="flex gap-2 mt-2 justify-end">
            <button
              type="button"
              className="bg-gray-300 text-gray-700 text-xs px-2 py-0.5 rounded hover:bg-blue-200 border border-blue-200 mr-1"
              onClick={() => setShowForm(false)}
            >Cancel</button>
            {form.id && (
              <button
                type="button"
                className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded hover:bg-red-200 border border-red-200"
                onClick={() => handleDeleteForm(form.id as number)}
              >Delete</button>
            )}
            <button
              type="submit"
              className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded hover:bg-blue-200 border border-blue-200 mr-1"
            >{form.id ? "Update" : "Add"} Link</button>
          </div>
        </form>
      )}
    </section>
  );
};

export default LinksSection;
