
import StudentRowTemplate from '../Components/studentRowTemplate';
import { useStudentAdd } from '../contexts/StudentAddContext';
import "../style/_shared.scss";

const StudentAdd = () => {
    const {
        students,
        projectInfo,
        maxStudents,
        minStudents,
        loading,
        error,
        handleStudentNameChange,
        handleUsernameChange,
        handleSubmit
    } = useStudentAdd();

    if (loading) {
        return (
            <div className="general-bg brushed-metal">
                <div className="glow-effect"></div>
                <div className="login-center">
                    <div className="form-container">
                        <h2>Chargement...</h2>
                        <p>Récupération des informations du projet...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="general-bg brushed-metal">
            <div className="glow-effect"></div>
            <div className="login-center">
                <div className="form-container">
                    <h2>Rejoindre le projet</h2>
                    {projectInfo && (
                        <div className="project-info">
                            <h3>{projectInfo.title}</h3>
                            <p>Organisation: {projectInfo.organization}</p>
                            {error && (
                                <div className="error-message">
                                    <p style={{color: 'red'}}>{error}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {!error && (
                        <>
                            <div className="students-section">
                                <h4>Membres du groupe ({minStudents}-{maxStudents} étudiants)</h4>
                                {students.map((student, index) => (
                                    <StudentRowTemplate
                                        key={index}
                                        index={index}
                                        studentName={student.name}
                                        username={student.username}
                                        onStudentNameChange={handleStudentNameChange}
                                        onUsernameChange={handleUsernameChange}
                                    />
                                ))}
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Création en cours...' : 'Créer le groupe'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentAdd;
