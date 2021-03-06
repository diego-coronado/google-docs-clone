import * as React from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import {
  ActionCableContext,
  DocumentsChannelSubscriber,
} from "../utils/action-cable";
import { useParams } from "react-router-dom";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  ["blockquote", "code-block"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

export default function TextEditor({ user }) {
  const { slug: documentSlug } = useParams();
  const [quill, setQuill] = React.useState();
  const { consumer } = React.useContext(ActionCableContext);
  const wrapperRef = React.useRef(null);

  const textChangeHandler = React.useCallback(
    (delta, oldDelta, source) => {
      if (source !== "user") return;
      consumer.send({
        command: "message",
        identifier: consumer.subscriptions.subscriptions[0].identifier,
        data: JSON.stringify({
          action: "test",
          data: JSON.stringify(delta),
          user,
        }),
      });
    },
    [consumer, user]
  );

  const onChanged = React.useCallback(
    (data, userId) => {
      if (user !== userId) quill.updateContents(data);
    },
    [quill, user]
  );

  const onSubscribed = React.useCallback(
    (data) => {
      quill.setContents(data);
      quill.enable();
    },
    [quill]
  );

  React.useLayoutEffect(() => {
    if (!wrapperRef) return;

    wrapperRef.current.innerHTML = "";
    const editor = document.createElement("div");
    wrapperRef.current.append(editor);

    const quill = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    setQuill(quill);
  }, []);

  React.useEffect(() => {
    if (!quill) return;

    const interval = setInterval(() => {
      const data = quill.getContents();
      fetch(window.location.href, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          slug: documentSlug,
          data: JSON.stringify(data),
        }),
      });
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [quill]);

  React.useEffect(() => {
    if (!quill) return;

    quill.on("text-change", textChangeHandler);

    return () => {
      quill.off("text-change", textChangeHandler);
    };
  }, [quill, textChangeHandler]);

  return (
    <DocumentsChannelSubscriber
      connection={{
        channel: "DocumentsChannel",
        document: documentSlug,
        user,
      }}
      onChanged={onChanged}
      onSubscribed={onSubscribed}
    >
      <div id="container" className="container" ref={wrapperRef}></div>
    </DocumentsChannelSubscriber>
  );
}
