# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { linkCurrentUser, createPatient, updatePatient, deletePatient, createAppointment, updateAppointmentStatus, updateAppointment, createConsultation, updateConsultation, deleteConsultation } from '@historias/dataconnect';


// Operation LinkCurrentUser: 
const { data } = await LinkCurrentUser(dataConnect);

// Operation CreatePatient:  For variables, look at type CreatePatientVars in ../index.d.ts
const { data } = await CreatePatient(dataConnect, createPatientVars);

// Operation UpdatePatient:  For variables, look at type UpdatePatientVars in ../index.d.ts
const { data } = await UpdatePatient(dataConnect, updatePatientVars);

// Operation DeletePatient:  For variables, look at type DeletePatientVars in ../index.d.ts
const { data } = await DeletePatient(dataConnect, deletePatientVars);

// Operation CreateAppointment:  For variables, look at type CreateAppointmentVars in ../index.d.ts
const { data } = await CreateAppointment(dataConnect, createAppointmentVars);

// Operation UpdateAppointmentStatus:  For variables, look at type UpdateAppointmentStatusVars in ../index.d.ts
const { data } = await UpdateAppointmentStatus(dataConnect, updateAppointmentStatusVars);

// Operation UpdateAppointment:  For variables, look at type UpdateAppointmentVars in ../index.d.ts
const { data } = await UpdateAppointment(dataConnect, updateAppointmentVars);

// Operation CreateConsultation:  For variables, look at type CreateConsultationVars in ../index.d.ts
const { data } = await CreateConsultation(dataConnect, createConsultationVars);

// Operation UpdateConsultation:  For variables, look at type UpdateConsultationVars in ../index.d.ts
const { data } = await UpdateConsultation(dataConnect, updateConsultationVars);

// Operation DeleteConsultation:  For variables, look at type DeleteConsultationVars in ../index.d.ts
const { data } = await DeleteConsultation(dataConnect, deleteConsultationVars);


```