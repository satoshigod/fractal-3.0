'use client'
import { ROL_LABEL } from '@/lib/format'
import { supabase } from '@/lib/supabase'

export default function Nav({ perfil }) {
  async function salir() { await supabase.auth.signOut(); window.location.href = '/plataforma' }
  return (
    <header className="top"><div className="wrap bar">
      <span className="brand">VIVE <b>FRACTAL</b></span>
      <div className="who">
        <a href="/marketplace" style={{fontSize:'12px',letterSpacing:'.04em',color:'var(--gold-l)',textDecoration:'none'}}>Marketplace</a>
        <span className="nm">{perfil?.nombre}</span>
        <span className="rolebadge">{ROL_LABEL[perfil?.rol] || perfil?.rol}</span>
        <button className="btn ghost" onClick={salir}>Salir</button>
      </div>
    </div></header>
  )
}
