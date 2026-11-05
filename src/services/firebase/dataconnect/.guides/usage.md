# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { linkCurrentUser, createPatient, updatePatient, createAppointment, updateAppointmentStatus, createConsultation, updateConsultation, signConsultation, addDiagnosis, deleteDiagnosis } from '@historias/dataconnect';


// Operation LinkCurrentUser: 
const { data } = await LinkCurrentUser(dataConnect);

// Operation CreatePatient:  For variables, look at type CreatePatientVars in ../index.d.ts
const { data } = await CreatePatient(dataConnect, createPatientVars);

// Operation UpdatePatient:  For variables, look at type UpdatePatientVars in ../index.d.ts
const { data } = await UpdatePatient(dataConnect, updatePatientVars);

// Operation CreateAppointment:  For variables, look at type CreateAppointmentVars in ../index.d.ts
const { data } = await CreateAppointment(dataConnect, createAppointmentVars);

// Operation UpdateAppointmentStatus:  For variables, look at type UpdateAppointmentStatusVars in ../index.d.ts
const { data } = await UpdateAppointmentStatus(dataConnect, updateAppointmentStatusVars);

// Operation CreateConsultation:  For variables, look at type CreateConsultationVars in ../index.d.ts
const { data } = await CreateConsultation(dataConnect, createConsultationVars);

// Operation UpdateConsultation:  For variables, look at type UpdateConsultationVars in ../index.d.ts
const { data } = await UpdateConsultation(dataConnect, updateConsultationVars);

// Operation SignConsultation:  For variables, look at type SignConsultationVars in ../index.d.ts
const { data } = await SignConsultation(dataConnect, signConsultationVars);

// Operation AddDiagnosis:  For variables, look at type AddDiagnosisVars in ../index.d.ts
const { data } = await AddDiagnosis(dataConnect, addDiagnosisVars);

// Operation DeleteDiagnosis:  For variables, look at type DeleteDiagnosisVars in ../index.d.ts
const { data } = await DeleteDiagnosis(dataConnect, deleteDiagnosisVars);


```