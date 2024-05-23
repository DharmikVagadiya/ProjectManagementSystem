import React, { useState } from 'react';
import Btn from '../common/btn';

export default function Reports() {
    const [selectedFilter, setSelectedFilter] = useState('');
    const [reportData, setReportData] = useState([]);

    const handleFilterChange = (event) => {
        setSelectedFilter(event.target.value);
        fetchReportData(event.target.value);
    };

    const fetchReportData = (filter) => {
        // Fetch report data based on the selected filter
        // Replace this with your actual data fetching logic
        const data = [
            { id: 1, teamName: 'Team A', studentName: 'John Doe', projectDetails: 'Project X' },
            { id: 2, teamName: 'Team B', studentName: 'Jane Smith', projectDetails: 'Project Y' },
            // Add more data as needed
        ];

        setReportData(data);
    };

    const downloadZipFile = () => {
        // Implement logic to download the zip file containing the report data
        // Replace this with your actual download functionality
        console.log('Downloading zip file...');
    };

    return (
        <div className='divInstitute'>
            <div className='breadcrumb mb-30px'>
                <div className='align-right d-flex'>
                    {/* <Dropdown className='dropdown-color ' Name='Branch' items={lstBranch} Value={BranchId} onSelectChange={loadSemester} />
                    <Dropdown className='dropdown-color ml-5px' Name='Semester' items={lstSemester} Value={SemesterId} onSelectChange={loadSection} />
                    <Dropdown className='dropdown-color ml-5px' Name='Section' items={lstSection} Value={SectionId} onSelectChange={setSectionId} /> */}
                </div>
                <h3 className='m-0'>Project Groups</h3>
            </div>
            <div className='inst-content'>
                <div className='divtitle mb-30px'>
                    <Btn Class='btn btn-refresh' Name='Download All'>
                        <i className='fa fa-download mr-10px'></i>
                    </Btn>
                    {/* <button className='btn btn-refresh ml-10px' onClick={() => refreshData()}>
              <i className='fa fa-refresh'></i>
              <label className='lblbtn ml-10px'>Refresh</label>
            </button> */}
                    <div className='align-right mt-5px d-flex'>
                        <div className='form-control searchbox'>
                            <input type='text' style={{ border: 'none' }} placeholder='Search...' ></input>
                            <i className='fa fa-angle-down searchOptions'></i>
                        </div>
                        <div className='search-options hidden col-lg-2 col-md-3 col-sm-4 col-xs-6'>
                            <select id="filter" className='form-control' value={selectedFilter} onChange={handleFilterChange}>
                                <option value="">Select a filter</option>
                                <option value="single-field">Group Wise All Team's Single Field Data</option>
                                <option value="all-data">Group Wise All Team's All Data</option>
                                <option value="team-details">Group Wise Team Details</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    {reportData.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Team Name</th>
                                    <th>Student Name</th>
                                    <th>Project Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.teamName}</td>
                                        <td>{item.studentName}</td>
                                        <td>{item.projectDetails}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No report data available.</p>
                    )}
                </div>

            </div>
        </div>
    );
};