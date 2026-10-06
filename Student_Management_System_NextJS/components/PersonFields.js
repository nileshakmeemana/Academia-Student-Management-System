'use client';

import { Field, INPUT } from './ui';

// Personal details used by register, admin add/edit and profile forms.
export default function PersonFields({ value = {}, role, withEmail = false, idPrefix = '', requireNames = true }) {
  const id = (n) => `${idPrefix}${n}`;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="First Name" htmlFor={id('firstName')}>
        <input className={INPUT} id={id('firstName')} name="firstName" defaultValue={value.firstName || ''} required={requireNames} maxLength={50} placeholder="Nilesh" />
      </Field>
      <Field label="Last Name" htmlFor={id('lastName')}>
        <input className={INPUT} id={id('lastName')} name="lastName" defaultValue={value.lastName || ''} required={requireNames} maxLength={50} placeholder="Akmeemana" />
      </Field>
      {withEmail && (
        <Field label="Email" htmlFor={id('email')} className="sm:col-span-2">
          <input className={INPUT} type="email" id={id('email')} name="email" defaultValue={value.email || ''} required maxLength={100} />
        </Field>
      )}
      <Field label="Date of Birth" htmlFor={id('dob')}>
        <input className={INPUT} type="date" id={id('dob')} name="dob" defaultValue={value.dob || ''} />
      </Field>
      <Field label="Gender" htmlFor={id('gender')}>
        <select className={INPUT} id={id('gender')} name="gender" defaultValue={value.gender || ''}>
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </Field>
      <Field label="Phone Number" htmlFor={id('phone')} className="sm:col-span-2">
        <input className={INPUT} id={id('phone')} name="phone" defaultValue={value.phone || ''} maxLength={20} inputMode="tel" placeholder="0771234567" />
      </Field>
      <Field label="Address" htmlFor={id('address')} className="sm:col-span-2">
        <textarea className={INPUT} id={id('address')} name="address" rows={2} defaultValue={value.address || ''} />
      </Field>
      {role === 'teacher' && (
        <Field label="Qualifications" htmlFor={id('qualification')} className="sm:col-span-2">
          <textarea className={INPUT} id={id('qualification')} name="qualification" rows={2} defaultValue={value.qualification || ''} />
        </Field>
      )}
    </div>
  );
}
