/**
 * Componente de carregamento para a página de autenticação
 *
 * Exibido enquanto a página de autenticação está sendo carregada.
 * Usa o mesmo estilo visual da plataforma principal.
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center">
        {/* Spinner de carregamento com as cores da plataforma */}
        <div className="w-12 h-12 border-4 border-[#2a2a2a] border-t-[rgb(1,219,151)] rounded-full animate-spin mb-4"></div>
        <p className="text-[#999]">Carregando...</p>
      </div>
    </div>
  );
}
