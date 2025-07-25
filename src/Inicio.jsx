import { useEffect } from "react"
import { useState } from "react"
import RotatingText from "./RotatingText"

function Inicio() {
    //States
    const [clima, setClima] = useState([])
    const [provincias, setProvincias] = useState([])
    const [localidad, setLocalidad] = useState([])
    const [localSeleccionada, setLocalidadSeleccionada] = useState("")
    const [provSeleccionada, setProvSeleccionada] = useState("")
    const [loadProvinces, setLoadProvinces] = useState(true)
    const [loadLoc, setLoadLoc] = useState(true)
    const [divClima, setDivClima] = useState(false)

    const apiKey = import.meta.env.VITE_API_KEY

    //clima funciones
    function mostrarClima() {
        const exclude = "minutely,hourly";
        const objeto = localidad.find(l => l.nombre === localSeleccionada)
        if (!objeto) {
            alert("No seleccionó ninguna localidad");
            divClima(false)
            return;
        }
        const lat = objeto.centroide.lat
        const lon = objeto.centroide.lon
        //llamada a la api
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Error en la respuesta de la API');
                }
                return res.json(); 
            })
            .then(data => setClima(data))
    }
    //Use Effect provincias
    useEffect(
        () => {
            fetch("https://apis.datos.gob.ar/georef/api/provincias")
                .then(res => res.json())
                .then(data => {
                    const provOrdenadas = data.provincias.sort(
                        (a, b) =>
                            a.nombre.localeCompare(b.nombre)
                    )
                    setProvincias(provOrdenadas)
                    setLoadProvinces(false)
                })
        }, []
    )
    //Update localities
    function updateLocalities(nombreProv) {
        setLoadLoc(true)
        let provClean = nombreProv.replace(/\s+/g, "-");
        fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${provClean}&max=500`)
            .then(res => res.json())
            .then(data => {
                const locOrdenadas = data.localidades.sort(
                    (a, b) =>
                        a.nombre.localeCompare(b.nombre)
                )
                setLocalidad(locOrdenadas)
                setLoadLoc(false)
            });
    }
    const show = {
        display: divClima ? "block" : "none"
    }

    return (
        <>
            <div className="header">
                <span className="titulo">Argentina</span>
                <RotatingText
                    texts={[
                        "Soleada",
                        "Lluviosa",
                        "Nublada",
                        "Nevada",
                        "Cálida",
                        "Fresca",
                        "Ventosa",
                        "Estacional",
                        "Tropical",
                        "Invernal",
                        "Primaveral",
                        "Otoñal",
                        "Brillante",
                        "Húmeda",
                        "Cambiante",
                        "Radiante"
                    ]}
                    mainClassName="rotating-text"
                    staggerFrom="last"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                />
            </div>
            <br />
            <br />
            {loadProvinces ? (
                <p id="carga">Cargando provincias...</p>
            ) : (
                <>
                    {/* selecciono una provincia */}
                    <select
                        id="provs"
                        onChange={(e) => {
                            const nombreProv = e.target.value;
                            setProvSeleccionada(nombreProv);
                            setLocalidadSeleccionada("");
                            updateLocalities(nombreProv);
                            setDivClima(false);
                            setClima([])
                        }}
                    >
                        <option value="">Seleccione una provincia</option>
                        {provincias.map((p) => (
                            <option key={p.id} value={p.nombre}>
                                {p.nombre}
                            </option>
                        ))}
                    </select>
                    <br />
                    <select
                        disabled={!provSeleccionada || loadLoc}
                        id="local"
                        value={localSeleccionada}
                        onChange={(e) => {
                            setLocalidadSeleccionada(e.target.value);
                            setDivClima(false)
                        }}
                    >
                        <option value="">Seleccione una localidad</option>
                        {localidad.map((l) => (
                            <option key={l.id} value={l.nombre}>
                                {l.nombre}
                            </option>
                        ))}
                    </select>
                    <br />
                    {/* mensaje de carga de localidades */}
                    {loadLoc && provSeleccionada && <p id="carga">Cargando localidades...</p>}
                    <button onClick={() => {
                        mostrarClima();
                        setDivClima(true);
                        setClima([])
                        window.location.href = "#clima"
                    }}>Ver Temperatura</button>
                    {/* mostrar datos del clima */}
                    <div className="clima" id="clima" style={show}>
                        <div className="clima-wrapper">
                            {clima.main && (
                                <div>
                                    <h2>{localSeleccionada}</h2>
                                    <h3>Temperatura actual: {clima.main.temp}°</h3>
                                    {/* imagen del clima */}
                                    {clima.weather && (
                                        <div>
                                            <img
                                                src={`https://openweathermap.org/img/wn/${clima.weather[0].icon}@2x.png`}
                                                alt={clima.weather[0].description}
                                            />
                                        </div>
                                    )}
                                    <div className="info-extra">
                                        <p>Temperatura mínima: <span id="info-api">{clima.main.temp_min}°</span></p>
                                        <p>Temperatura máxima: <span id="info-api">{clima.main.temp_max}°</span></p>
                                        <p>Sensación térmica: <span id="info-api">{clima.main.feels_like}°</span></p>
                                    </div>
                                </div>
                            )}
                            {/* datos del viento */}
                            {clima.wind && (
                                <div className="info-extra">
                                    <p>Dirección del viento: <span id="info-api">{clima.wind.deg}°</span></p>
                                    <p>Ráfaga máxima: <span id="info-api">{clima.wind.gust} m/s</span></p>
                                    <p>Velocidad promedio del viento: <span id="info-api">{clima.wind.speed} m/s</span></p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )
            }
        </>
    );
}

export default Inicio