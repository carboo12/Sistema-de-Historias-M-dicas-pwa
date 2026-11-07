const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'historias',
  service: 'studio-9955473018-e374d-service',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const linkCurrentUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LinkCurrentUser');
}
linkCurrentUserRef.operationName = 'LinkCurrentUser';
exports.linkCurrentUserRef = linkCurrentUserRef;

exports.linkCurrentUser = function linkCurrentUser(dc) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dc, undefined);
  return executeMutation(linkCurrentUserRef(dcInstance, inputVars));
}
;

const createPatientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePatient', inputVars);
}
createPatientRef.operationName = 'CreatePatient';
exports.createPatientRef = createPatientRef;

exports.createPatient = function createPatient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createPatientRef(dcInstance, inputVars));
}
;

const updatePatientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePatient', inputVars);
}
updatePatientRef.operationName = 'UpdatePatient';
exports.updatePatientRef = updatePatientRef;

exports.updatePatient = function updatePatient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updatePatientRef(dcInstance, inputVars));
}
;

const updatePatientWithClinicContextRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePatientWithClinicContext', inputVars);
}
updatePatientWithClinicContextRef.operationName = 'UpdatePatientWithClinicContext';
exports.updatePatientWithClinicContextRef = updatePatientWithClinicContextRef;

exports.updatePatientWithClinicContext = function updatePatientWithClinicContext(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updatePatientWithClinicContextRef(dcInstance, inputVars));
}
;

const deletePatientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeletePatient', inputVars);
}
deletePatientRef.operationName = 'DeletePatient';
exports.deletePatientRef = deletePatientRef;

exports.deletePatient = function deletePatient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deletePatientRef(dcInstance, inputVars));
}
;

const createAppointmentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAppointment', inputVars);
}
createAppointmentRef.operationName = 'CreateAppointment';
exports.createAppointmentRef = createAppointmentRef;

exports.createAppointment = function createAppointment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAppointmentRef(dcInstance, inputVars));
}
;

const updateAppointmentStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateAppointmentStatus', inputVars);
}
updateAppointmentStatusRef.operationName = 'UpdateAppointmentStatus';
exports.updateAppointmentStatusRef = updateAppointmentStatusRef;

exports.updateAppointmentStatus = function updateAppointmentStatus(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateAppointmentStatusRef(dcInstance, inputVars));
}
;

const updateAppointmentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateAppointment', inputVars);
}
updateAppointmentRef.operationName = 'UpdateAppointment';
exports.updateAppointmentRef = updateAppointmentRef;

exports.updateAppointment = function updateAppointment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateAppointmentRef(dcInstance, inputVars));
}
;

const createConsultationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateConsultation', inputVars);
}
createConsultationRef.operationName = 'CreateConsultation';
exports.createConsultationRef = createConsultationRef;

exports.createConsultation = function createConsultation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createConsultationRef(dcInstance, inputVars));
}
;

const updateConsultationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateConsultation', inputVars);
}
updateConsultationRef.operationName = 'UpdateConsultation';
exports.updateConsultationRef = updateConsultationRef;

exports.updateConsultation = function updateConsultation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateConsultationRef(dcInstance, inputVars));
}
;

const updateConsultationWithClinicContextRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateConsultationWithClinicContext', inputVars);
}
updateConsultationWithClinicContextRef.operationName = 'UpdateConsultationWithClinicContext';
exports.updateConsultationWithClinicContextRef = updateConsultationWithClinicContextRef;

exports.updateConsultationWithClinicContext = function updateConsultationWithClinicContext(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateConsultationWithClinicContextRef(dcInstance, inputVars));
}
;

const saveConsultationWithClinicContextRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SaveConsultationWithClinicContext', inputVars);
}
saveConsultationWithClinicContextRef.operationName = 'SaveConsultationWithClinicContext';
exports.saveConsultationWithClinicContextRef = saveConsultationWithClinicContextRef;

exports.saveConsultationWithClinicContext = function saveConsultationWithClinicContext(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(saveConsultationWithClinicContextRef(dcInstance, inputVars));
}
;

const signConsultationWithClinicContextRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SignConsultationWithClinicContext', inputVars);
}
signConsultationWithClinicContextRef.operationName = 'SignConsultationWithClinicContext';
exports.signConsultationWithClinicContextRef = signConsultationWithClinicContextRef;

exports.signConsultationWithClinicContext = function signConsultationWithClinicContext(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(signConsultationWithClinicContextRef(dcInstance, inputVars));
}
;

const deleteConsultationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteConsultation', inputVars);
}
deleteConsultationRef.operationName = 'DeleteConsultation';
exports.deleteConsultationRef = deleteConsultationRef;

exports.deleteConsultation = function deleteConsultation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteConsultationRef(dcInstance, inputVars));
}
;

const deleteConsultationWithClinicContextRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteConsultationWithClinicContext', inputVars);
}
deleteConsultationWithClinicContextRef.operationName = 'DeleteConsultationWithClinicContext';
exports.deleteConsultationWithClinicContextRef = deleteConsultationWithClinicContextRef;

exports.deleteConsultationWithClinicContext = function deleteConsultationWithClinicContext(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteConsultationWithClinicContextRef(dcInstance, inputVars));
}
;

const signConsultationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SignConsultation', inputVars);
}
signConsultationRef.operationName = 'SignConsultation';
exports.signConsultationRef = signConsultationRef;

exports.signConsultation = function signConsultation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(signConsultationRef(dcInstance, inputVars));
}
;

const createPatientStudyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePatientStudy', inputVars);
}
createPatientStudyRef.operationName = 'CreatePatientStudy';
exports.createPatientStudyRef = createPatientStudyRef;

exports.createPatientStudy = function createPatientStudy(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createPatientStudyRef(dcInstance, inputVars));
}
;

const getSessionRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSession');
}
getSessionRef.operationName = 'GetSession';
exports.getSessionRef = getSessionRef;

exports.getSession = function getSession(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getSessionRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listPatientsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPatients', inputVars);
}
listPatientsRef.operationName = 'ListPatients';
exports.listPatientsRef = listPatientsRef;

exports.listPatients = function listPatients(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listPatientsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const countPatientsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CountPatients', inputVars);
}
countPatientsRef.operationName = 'CountPatients';
exports.countPatientsRef = countPatientsRef;

exports.countPatients = function countPatients(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(countPatientsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listPatientsByTermsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPatientsByTerms', inputVars);
}
listPatientsByTermsRef.operationName = 'ListPatientsByTerms';
exports.listPatientsByTermsRef = listPatientsByTermsRef;

exports.listPatientsByTerms = function listPatientsByTerms(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listPatientsByTermsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const countPatientsByTermsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CountPatientsByTerms', inputVars);
}
countPatientsByTermsRef.operationName = 'CountPatientsByTerms';
exports.countPatientsByTermsRef = countPatientsByTermsRef;

exports.countPatientsByTerms = function countPatientsByTerms(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(countPatientsByTermsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getPatientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPatient', inputVars);
}
getPatientRef.operationName = 'GetPatient';
exports.getPatientRef = getPatientRef;

exports.getPatient = function getPatient(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getPatientRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listAgendaRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAgenda', inputVars);
}
listAgendaRef.operationName = 'ListAgenda';
exports.listAgendaRef = listAgendaRef;

exports.listAgenda = function listAgenda(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listAgendaRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listAgendaForClinicRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAgendaForClinic', inputVars);
}
listAgendaForClinicRef.operationName = 'ListAgendaForClinic';
exports.listAgendaForClinicRef = listAgendaForClinicRef;

exports.listAgendaForClinic = function listAgendaForClinic(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listAgendaForClinicRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listConsultationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListConsultations');
}
listConsultationsRef.operationName = 'ListConsultations';
exports.listConsultationsRef = listConsultationsRef;

exports.listConsultations = function listConsultations(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listConsultationsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getConsultationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetConsultation', inputVars);
}
getConsultationRef.operationName = 'GetConsultation';
exports.getConsultationRef = getConsultationRef;

exports.getConsultation = function getConsultation(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getConsultationRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listPatientStudiesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPatientStudies', inputVars);
}
listPatientStudiesRef.operationName = 'ListPatientStudies';
exports.listPatientStudiesRef = listPatientStudiesRef;

exports.listPatientStudies = function listPatientStudies(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listPatientStudiesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getCatalogsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCatalogs');
}
getCatalogsRef.operationName = 'GetCatalogs';
exports.getCatalogsRef = getCatalogsRef;

exports.getCatalogs = function getCatalogs(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getCatalogsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const clinicReportsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ClinicReports', inputVars);
}
clinicReportsRef.operationName = 'ClinicReports';
exports.clinicReportsRef = clinicReportsRef;

exports.clinicReports = function clinicReports(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(clinicReportsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;
