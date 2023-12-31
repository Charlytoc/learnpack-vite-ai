import SimpleButton from "./Button";
import useStore from "../../utils/store";
import { svgs } from "../../resources/svgs";
import { useState } from "react";
export default function ResetButton() {

    const [showModal, setShowModal] = useState(false);

    const toggleModal = () => {
        // First I need to show a modal to ensure the ensure wants to reset the exercise
        setShowModal(!showModal);
    }

    return <>
        <SimpleButton extraClass="pill border-blue color-blue" svg={svgs.resetIcon} text="Reset" action={toggleModal} />
        {showModal && <ResetModal toggleModal={toggleModal} />}
    </>
}

interface IResetModal {
    toggleModal: () => void
}


const ResetModal = ({ toggleModal }: IResetModal) => {
    const { compilerSocket, exercises, currentExercisePosition } = useStore();

    const handleReset = () => {
        const data = {
            exerciseSlug: exercises[currentExercisePosition].slug
        }

        compilerSocket.emit("reset", data);

        toggleModal();
    }
    return <div className="modal">
        <div>
            <p>Are you sure you want to reset the exercise? You will lose all your progress</p>

            <section>
                <SimpleButton text="Reset" extraClass="pill bg-blue" action={handleReset} />
                <SimpleButton text="Cancel" extraClass="pill border-blue color-blue" action={toggleModal} />
            </section>
        </div>

    </div>
}