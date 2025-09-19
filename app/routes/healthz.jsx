import { json } from "@remix-run/node";

export const loader = async () => {
  return json({ status: "ok" }, { status: 200 });
};

export default function Healthz() {
  // Ye component optional hai, bas dummy return kar raha hu
  return <div>OK</div>;
}
