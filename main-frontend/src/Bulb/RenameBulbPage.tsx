import { message, Typography } from "antd";
import { Input } from "../components/molecules/Input";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/atoms/Button";
import { useApiService } from "../contexts/ApiServiceContext";
import { useBulbsContext } from "../contexts/BulbsContext";

export const RenameBulbPage: FC = () => {
  const { id: bulbId } = useParams();
  const { bulbs, setBulbs } = useBulbsContext();
  const thisBulb = useMemo(
    () => bulbs.find((it) => it.id === bulbId),
    [bulbs, bulbId]
  );
  const navigate = useNavigate();
  const [bulbNameFieldValue, setBulbNameFieldValue] = useState<string>(
    thisBulb?.name || ""
  );
  const apiService = useApiService();

  useEffect(() => {
    setBulbNameFieldValue(thisBulb?.name || "");
  }, [thisBulb]);

  const setBulbName = useCallback(async () => {
    try {
      const newName = bulbNameFieldValue;
      await apiService.renameBulb(bulbId!, newName);
      const bulbIndex = bulbs.findIndex((it) => it.id === bulbId);
      const updatedBulbs = [...bulbs];
      updatedBulbs[bulbIndex] = { ...updatedBulbs[bulbIndex], name: newName };
      setBulbs(updatedBulbs);
      message.success("Name changed");
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
        message.error(err.message ?? "Unknown Error");
        return;
      }
      message.error("Unknown Error");
    }
  }, [apiService, bulbId, bulbNameFieldValue, bulbs, setBulbs]);

  if (!bulbId) {
    navigate(-1);
    return null;
  }

  return (
    <div>
      <Typography.Title>
        Set {thisBulb?.name || thisBulb?.id} Name
      </Typography.Title>
      <Input
        value={bulbNameFieldValue}
        onChange={(e) => setBulbNameFieldValue(e.target.value)}
      />
      <Button onClick={setBulbName}>Set Name</Button>
    </div>
  );
};
