import { Modal } from '../ui-kit/Modal';

const DeleteOrganizationModal = ({ isOpen, toggle, onDeleteAction }) => {
  async function handleDelete() {
    await onDeleteAction();
    toggle();
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle} skipOutsideClickEvent={true}>
      <Modal.Header toggle={toggle}>Delete Organization</Modal.Header>
      <Modal.Body>
        <div>
          <p>Are you sure for permanently delete this organization?</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex-1" />
        <div className="flex flex-1 flex-row-reverse">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="outline-none focus:outline-none mx-2 mb-3 w-full cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
          >
            Delete
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle();
            }}
            className="outline-none focus:outline-none mx-2 mb-3 w-full cursor-pointer rounded bg-brand-secondary py-2 px-4 font-bold text-white focus:ring"
          >
            Cancel
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteOrganizationModal;
