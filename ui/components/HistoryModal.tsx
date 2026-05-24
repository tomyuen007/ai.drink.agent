import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { S } from "../lib/styles";
import type { IComponentBase } from "../lib/ComponentBase";
import type { IAskResponse } from "../lib/AskResponse";
import type { IHistoryModalHandle } from "./HistoryModalHandle";

export interface IHistoryModalProps extends IComponentBase {
  items: IAskResponse[];
}

/**
 * Usage from any component:
 *
 *   const historyRef = useRef<IHistoryModalHandle>(null);
 *   <HistoryModal ref={historyRef} items={history} id="history" tag="modal" callback={() => {}} />
 *   <Button onPress={() => historyRef.current?.open()} />
 */
const HistoryModal = forwardRef<IHistoryModalHandle, IHistoryModalProps>(
  ({ items, id, tag, callback }, ref) => {
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      id,
      tag,
      callback,
      describe: () => `[${tag}] ${id}`,
      open:  () => setVisible(true),
      close: () => setVisible(false),
    }));

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View className={S.modalOverlay}>
          <View className={S.modalSheet}>
            <Text className={S.modalTitle}>History</Text>
            <ScrollView style={{ maxHeight: 420 }}>
              {items.length === 0 ? (
                <Text className={S.historyEmpty}>No questions asked yet.</Text>
              ) : (
                items.map((h) => (
                  <View key={h.id} className={S.historyItem}>
                    <Text className={S.historyCity}>{h.city}</Text>
                    <Text className={S.historyQuestion}>"{h.question}"</Text>
                    <Text className={S.historyAnswer}>{h.answer}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <Pressable className={S.modalClose} onPress={() => setVisible(false)}>
              <Text className={S.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }
);

HistoryModal.displayName = "HistoryModal";
export default HistoryModal;
