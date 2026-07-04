import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Loader2,
  Smartphone,
} from 'lucide-react'

function SubirComprobante() {
  const { codigo } = useParams()

  const [pedido, setPedido] = useState(null)
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        const response = await api.get(`/pedidos/publico/${codigo}`)
        setPedido(response.data.pedido)
      } catch (err) {
        setMensaje({
          tipo: 'error',
          texto: 'No se encontró el pedido o el link no es válido.',
        })
      } finally {
        setCargando(false)
      }
    }

    cargarPedido()
  }, [codigo])

  const seleccionarArchivo = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']

    if (!tiposPermitidos.includes(file.type)) {
      setMensaje({
        tipo: 'error',
        texto: 'Solo se permite subir JPG, PNG o PDF.',
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setMensaje({
        tipo: 'error',
        texto: 'El archivo no puede pesar más de 10MB.',
      })
      return
    }

    setArchivo(file)
    setMensaje(null)

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const enviarComprobante = async () => {
    if (!archivo) {
      setMensaje({
        tipo: 'error',
        texto: 'Selecciona una imagen o PDF del comprobante.',
      })
      return
    }

    setEnviando(true)
    setMensaje(null)

    try {
      const formData = new FormData()
      formData.append('comprobante', archivo)

      await api.post(`/pedidos/${codigo}/comprobante`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setMensaje({
        tipo: 'exito',
        texto: 'Comprobante enviado correctamente. Gracias por tu pago.',
      })

      setArchivo(null)
      setPreview(null)
    } catch (err) {
      setMensaje({
        tipo: 'error',
        texto: err.response?.data?.message || 'No se pudo enviar el comprobante.',
      })
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-white">
        <Loader2 className="animate-spin mr-2" />
        Cargando pedido...
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center">
          <AlertCircle size={48} className="text-[#E4002B] mx-auto mb-3" />
          <h1 className="text-xl font-black text-[#1A1A1A]">Pedido no encontrado</h1>
          <p className="text-[#6B6862] text-sm mt-2">
            El enlace del comprobante no es válido.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] px-4 py-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-[#E4002B] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Smartphone size={36} className="text-white" />
          </div>

          <h1 className="text-white text-3xl font-black">
            Rooster <span className="text-[#E4002B]">Pizza</span>
          </h1>
          <p className="text-white/50 text-sm">Subir comprobante SINPE</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#E4002B] via-[#F5A300] to-[#E4002B]" />

          <div className="p-6">
            <div className="bg-[#FFF9F0] border border-[#F5A300]/40 rounded-2xl p-4 text-center mb-5">
              <p className="text-[#6B6862] text-xs uppercase font-bold">
                Pedido
              </p>
              <p className="text-[#1A1A1A] text-2xl font-black">
                #{pedido.codigo_tracking}
              </p>

              <div className="mt-3 border-t border-[#E5E2DC] pt-3">
                <p className="text-[#6B6862] text-xs">Total a pagar</p>
                <p className="text-[#E4002B] text-3xl font-black">
                  ₡{parseFloat(pedido.total).toLocaleString('es-CR')}
                </p>
              </div>
            </div>

            {pedido.comprobante_pago_url ? (
              <div className="bg-[#EAF3DE] border border-[#C9E0B0] rounded-2xl p-4 text-center">
                <CheckCircle size={42} className="text-[#3B6D11] mx-auto mb-2" />
                <h2 className="text-[#3B6D11] font-black">
                  Comprobante recibido
                </h2>
                <p className="text-[#3B6D11]/80 text-sm mt-1">
                  Ya recibimos el comprobante de este pedido.
                </p>
              </div>
            ) : (
              <>
                <label
                  htmlFor="comprobante"
                  className="border-2 border-dashed border-[#E4002B]/40 bg-[#FFF9F0] hover:bg-[#FFF1E3] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors"
                >
                  <UploadCloud size={46} className="text-[#E4002B] mb-2" />
                  <p className="text-[#1A1A1A] font-black text-sm">
                    Selecciona tu comprobante
                  </p>
                  <p className="text-[#6B6862] text-xs text-center mt-1">
                    Puedes subir una imagen JPG, PNG o un PDF.
                  </p>
                  <p className="text-[#9B988F] text-[11px] mt-1">
                    Máximo 10MB
                  </p>
                </label>

                <input
                  id="comprobante"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={seleccionarArchivo}
                  className="hidden"
                />

                {archivo && (
                  <div className="mt-4 bg-[#F8F6F1] border border-[#E5E2DC] rounded-2xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-[#E5E2DC]">
                        {archivo.type === 'application/pdf' ? (
                          <FileText className="text-[#E4002B]" />
                        ) : (
                          <ImageIcon className="text-[#E4002B]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[#1A1A1A] font-bold text-sm truncate">
                          {archivo.name}
                        </p>
                        <p className="text-[#6B6862] text-xs">
                          Archivo seleccionado
                        </p>
                      </div>
                    </div>

                    {preview && (
                      <img
                        src={preview}
                        alt="Vista previa"
                        className="mt-3 rounded-xl border border-[#E5E2DC] max-h-56 w-full object-contain bg-white"
                      />
                    )}
                  </div>
                )}

                {mensaje && (
                  <div
                    className={`mt-4 text-sm font-medium px-4 py-3 rounded-xl ${
                      mensaje.tipo === 'exito'
                        ? 'bg-[#EAF3DE] text-[#3B6D11] border border-[#C9E0B0]'
                        : 'bg-[#FCEBEB] text-[#A32D2D] border border-[#F09595]'
                    }`}
                  >
                    {mensaje.texto}
                  </div>
                )}

                <button
                  onClick={enviarComprobante}
                  disabled={enviando || !archivo}
                  className="w-full mt-5 bg-[#E4002B] hover:bg-[#F5A300] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3 rounded-2xl transition-colors"
                >
                  {enviando ? 'Enviando...' : 'Enviar comprobante'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubirComprobante