const JAKARTA_BARAT_CENTER = { lat: -6.17, lng: 106.78 }

function getCurrentPosition(timeoutMs = 5000) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(JAKARTA_BARAT_CENTER)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        resolve(JAKARTA_BARAT_CENTER)
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 60000,
      },
    )
  })
}

export { getCurrentPosition, JAKARTA_BARAT_CENTER }
