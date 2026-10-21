import { Modal, Pressable, View } from "react-native";

import type { Metric } from "../../types/metric";
import { MetricValue } from "./MetricValue";

type MetricSheetProps = {
  visible: boolean;
  metrics: Metric[];
  anchorY: number;
  onSelect: (metric: Metric) => void;
  onClose: () => void;
};

export function MetricSheet({
  visible,
  metrics,
  anchorY,
  onSelect,
  onClose,
}: MetricSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        accessibilityLabel="Close metrics"
        className="absolute inset-0"
      />
      <View
        className="absolute right-4 gap-4 rounded-3xl bg-surface p-6"
        style={{ top: anchorY + 8 }}
      >
        {metrics.map((metric) => (
          <Pressable
            key={metric.label}
            onPress={() => onSelect(metric)}
            accessibilityRole="button"
            className="items-end"
          >
            <MetricValue metric={metric} />
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}
