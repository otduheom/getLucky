import React from 'react';

export default function ErrorPage() {
  return (
    <div
      style={{
        height: '100vh',
        fontFamily: 'Montserrat',
        fontWeight: 'bolder',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <h1>An error has occurred.</h1>
      <h1>
        <span>(╯°□°）╯︵ ┻━┻</span>
      </h1>
    </div>
  );
}

