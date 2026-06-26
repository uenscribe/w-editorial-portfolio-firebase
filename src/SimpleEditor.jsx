import { useState } from "react";
import { supabase } from "./supabase";

export default function SimpleEditor() {
  const [text, setText] = useState("");

  // 保存到云端
  const save = async () => {
    await supabase.from("content").upsert({
      id: "main",
      data: text
    });

    alert("保存成功");
  };

  // 从云端读取
  const load = async () => {
    const { data } = await supabase
      .from("content")
      .select("*")
      .eq("id", "main")
      .single();

    if (data) {
      setText(data.data);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={load}>📥 读取内容</button>

      <br /><br />

      <textarea
        style={{ width: "100%", height: "200px" }}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br /><br />

      <button onClick={save}>💾 保存到云端</button>
    </div>
  );
}