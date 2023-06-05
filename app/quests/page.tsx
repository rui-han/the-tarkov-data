import Image from "next/image";
import QuestImage from "../../public/images/quests.jpeg";

export default function Quests() {
  return (
    <>
      <Image
        style={{ width: "100%", height: "100%" }}
        src={QuestImage}
        alt=""
      />
    </>
  );
}