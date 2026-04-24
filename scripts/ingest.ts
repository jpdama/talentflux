import { runIngest } from "@/lib/ingest/run-ingest";

async function main() {
  const result = await runIngest();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
