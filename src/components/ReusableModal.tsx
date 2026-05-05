import { ComponentPropsWithoutRef, PropsWithChildren } from "react";
import { Modal } from "react-native";

export interface ReusableModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  modalProps?: ComponentPropsWithoutRef<typeof Modal>;
}

export default function ReusableModal(
  props: PropsWithChildren<ReusableModalProps>,
) {
  return (
    <Modal
      animationType="slide"
      allowSwipeDismissal={true}
      visible={props.showModal}
      onRequestClose={() => props.setShowModal(false)}
      {...props.modalProps}
    >
      {props.children}
    </Modal>
  );
}
