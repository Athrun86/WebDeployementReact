import React from 'react';
import '../style/_shared.scss';

interface StudentRowTemplateProps {
    index: number;
    studentName: string;
    username: string;
    onStudentNameChange: (index: number, value: string) => void;
    onUsernameChange: (index: number, value: string) => void;
}

const StudentRowTemplate: React.FC<StudentRowTemplateProps> = ({
    index,
    studentName,
    username,
    onStudentNameChange,
    onUsernameChange
}) => {
    return (
        <div className="student-row">
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Nom de l'étudiant"
                    value={studentName}
                    onChange={(e) => onStudentNameChange(index, e.target.value)}
                    className="form-input"
                />
            </div>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Pseudonyme GitHub"
                    value={username}
                    onChange={(e) => onUsernameChange(index, e.target.value)}
                    className="form-input"
                />
            </div>
        </div>
    );
};

export default StudentRowTemplate;
