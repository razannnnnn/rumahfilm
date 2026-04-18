import { Suspense } from "react";
import PageLoader from "./PageLoader";

export default function PageLoaderWrapper() {
  return (
    <Suspense fallback={null}>
      <PageLoader />
    </Suspense>
  );
}