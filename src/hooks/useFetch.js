import { useEffect, useState } from "react";

// 비동기 함수를 실행해서 { data, status } 반환 (status: loading | done | error)
// fetcher(signal): 요청 함수. 화면을 벗어나거나 deps가 바뀌면 signal로 이전 요청을 취소함
// getCached(): 캐시된 데이터가 있으면 반환. 있으면 요청 없이 바로 표시 (로딩 문구 깜빡임 방지)
export default function useFetch(fetcher, deps, getCached) {
  const key = JSON.stringify(deps);
  const [result, setResult] = useState({ key: null, data: null, status: "loading" });
  const cached = getCached?.();

  useEffect(() => {
    if (getCached?.() !== undefined) return;

    const controller = new AbortController();
    fetcher(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, data, status: "done" });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("데이터 불러오기 실패:", err);
        setResult({ key, data: null, status: "error" });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (cached !== undefined) return { data: cached, status: "done" };
  // deps가 바뀐 직후에는 이전 결과 대신 로딩 상태를 보여줌
  if (result.key !== key) return { data: null, status: "loading" };
  return result;
}
