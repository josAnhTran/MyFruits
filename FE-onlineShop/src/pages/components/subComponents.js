import React from "react";
const urlIcon = "./imageIcons/icon03.png";

function LabelCustomization({ title }) {
  return <div style={{ fontWeight: 600 }}>{title}</div>;
}

function BoldText({title}) {
  return (
    <div
      style={{
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {title}
    </div>
  );
}
//
function ImgIcon() {
  return (
    <img
      src={urlIcon}
      width="32px"
      height="32px"
      alt="test"
      background-color="green"
    />
  );
}
//
function TitleTable({text}) {
  return (
    <div
      style={{
        textAlign: "center",
        fontWeight: 600,
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );
}

export default LabelCustomization;
export { BoldText, ImgIcon, TitleTable };
