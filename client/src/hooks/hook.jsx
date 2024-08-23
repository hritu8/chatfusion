import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useErrors = (errors = []) => {
  useEffect(() => {
    errors.forEach(({ isError, error, fallback }) => {
      if (isError) {
        if (fallback) fallback();
        else toast.error(error?.data?.message || "Something went wrong");
      }
    });
  }, [errors]);
};

const useAsyncMutation = (mutationHook) => {
  const [mutate] = mutationHook();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);

  const executeMutation = async (toastMessage, ...args) => {
    setIsLoading(true);
    const toastId = toast.loading(toastMessage || "Updating data...");
    try {
      const res = await mutate(...args);
      
      console.log("res hook", res);
      if (res.data) {
        console.log("res.data", res.data);
        toast.success(res?.data?.message || "Updated data successfully", {
          id: toastId,
        });
        setData(res.data);
      } else {
        console.log("res.data error", res.data);
        toast.error(res?.error?.data?.message || "Something went wrong", {
          id: toastId,
        });
      }
    } catch (err) {
      console.log("err", err);
      toast.error("Something went wrong", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return [executeMutation, isLoading, data];
};

export { useErrors, useAsyncMutation };
