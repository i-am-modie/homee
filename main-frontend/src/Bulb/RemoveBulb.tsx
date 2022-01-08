import { message, Typography } from "antd";
import { FC, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/atoms/Button";
import { useApiService } from "../contexts/ApiServiceContext";
import { useBulbsContext } from "../contexts/BulbsContext";

export const RemoveBulb: FC = () => {
  const { id: bulbId } = useParams();
  const { bulbs, setBulbs } = useBulbsContext();
  const thisBulb = useMemo(
    () => bulbs.find((it) => it.id === bulbId),
    [bulbs, bulbId]
  );
  const navigate = useNavigate();
  const apiService = useApiService();

  const setBulbName = useCallback(async () => {
    try {
      await apiService.deleteBulb(bulbId!);
      setBulbs(bulbs.filter((bulb) => bulb.id !== bulbId));
      navigate(-1);
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
        message.error(err.message ?? "Unknown Error");
        return;
      }
      message.error("Unknown Error");
    }
  }, [apiService, bulbId, bulbs, navigate, setBulbs]);

  if (!bulbId) {
    navigate(-1);
    return null;
  }

  return (
    <div>
      <Typography.Title>
        Remove {thisBulb?.name || thisBulb?.id}
      </Typography.Title>
      {thisBulb?.isShared && (
        <Typography.Title level={2}>
          Do you want to remove {thisBulb?.name || thisBulb?.id}?
          As it's only bulb that is shared you won't be able to add it without contact with it's owner!
        </Typography.Title>
      )}
      {!thisBulb?.isShared && (
        <Typography.Title level={2}>
          Do you want to remove {thisBulb?.name || thisBulb?.id}? This bulb will
          be added again when it will appear in gateway network
        </Typography.Title>
      )}
      <Button color="danger" onClick={setBulbName}>
        Remove bulb
      </Button>
    </div>
  );
};
