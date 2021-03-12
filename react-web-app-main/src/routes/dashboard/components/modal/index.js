import React, { useCallback, useEffect, useState } from 'react'
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import './index.css'

const customStyles = {
  content : {
    top                   : '20%',
    left                  : '20%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

const PrismModal = (props) => {


  var subtitle;
  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = '#f00';
  }

  function closeModal(){
    setIsOpen(false);
  }


  // const generateTooltip = useCallback(
  //   (e) => {
  //     return (<ChartTooltip text={e.point.serieId} value={e.point.data.y} />)
  //   }, []
  // )

  return (
    <div className="modal-container">
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
      >

        <h2 ref={_subtitle => (subtitle = _subtitle)}>Hello</h2>
        <button onClick={closeModal}>close</button>
        <div>I am a modal</div>

      </Modal>
    </div>
  )
}

export default PrismModal;
