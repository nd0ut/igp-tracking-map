import { type LinksFunction } from "remix";
import ucBlocksStyles from "~/styles/uc-basic.css";
import { Portal } from "./Portal";
import { useCallback, useEffect, useRef, useState } from "react";
import uploaderStyles from "./uploader.css";
import { type UploadcareFile } from "@uploadcare/uc-blocks/submodules/upload-client/upload-client";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: ucBlocksStyles },
    { rel: "stylesheet", href: uploaderStyles },
  ];
};

export function Uploader({
  className,
  onChange,
}: {
  className?: string;
  onChange: (files: UploadcareFile[]) => void;
}) {
  const [ucReady, setUcReady] = useState<boolean>(false);
  const [ssr, setSsr] = useState<boolean>(true);
  const dataOutputRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLElement>(null);

  const handleDataOutput = useCallback((e: Event) => {
    const {detail} = e as CustomEvent;
    const data = detail.data as UploadcareFile[]
    const images = data.filter(file => file.isImage);
    onChange?.(images);
  }, [onChange]);

  useEffect(() => {
    setSsr(false);
  }, []);

  useEffect(() => {
    if (!ssr) {
      // @ts-ignore
      import("@uploadcare/uc-blocks").then((UC) => {
        UC.registerBlocks(UC);
        setUcReady(true);
      });
    }
  }, [ssr]);

  useEffect(() => {
    if (ssr || !ucReady) {
      return;
    }
    const btnEl = btnRef.current;
    btnEl?.querySelector("button")?.classList.add("btn", "btn-accent");
    btnEl?.querySelector("button")?.setAttribute("type", "button");

    const dataOutputEl = dataOutputRef.current;
    dataOutputEl?.addEventListener("data-output", handleDataOutput);
    return () => {
      dataOutputEl?.removeEventListener("data-output", handleDataOutput);
    };
  }, [handleDataOutput, ssr, ucReady]);

  if (ssr) {
    return null;
  }

  return (
    <div className={className}>
      <uc-simple-btn
        ref={btnRef}
        class="uc-wgt-common uploader"
      ></uc-simple-btn>

      <uc-modal strokes class="uc-wgt-common uploader">
        <uc-activity-icon slot="heading"></uc-activity-icon>
        <uc-activity-caption slot="heading"></uc-activity-caption>
        <uc-start-from>
          <uc-source-list wrap></uc-source-list>
          <uc-drop-area></uc-drop-area>
        </uc-start-from>
        <uc-upload-list></uc-upload-list>
        <uc-camera-source></uc-camera-source>
        <uc-url-source></uc-url-source>
        <uc-external-source></uc-external-source>
        <uc-upload-details></uc-upload-details>
        <uc-confirmation-dialog></uc-confirmation-dialog>
        <uc-cloud-image-editor></uc-cloud-image-editor>
      </uc-modal>


      <Portal node={typeof document !== "undefined" ? document.body : null}>
        <uc-message-box class="uc-wgt-common uploader"></uc-message-box>
        <uc-progress-bar-common class="uc-wgt-common uploader"></uc-progress-bar-common>
      </Portal>

      <uc-data-output
        ref={dataOutputRef}
        fire-event
        class="uc-wgt-common uploader"
        onDataOutput={console.log}
      ></uc-data-output>
    </div>
  );
}
