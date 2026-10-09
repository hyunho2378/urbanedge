// ops/Products.jsx: 상품과 가격표. 표 수정 즉시 키오스크 결제 화면 반영
// 코드를 몰라도 되게 한 줄이 한 상품이다: 이름(한/영), 컷 수, 인화 장수, 가격, 사용 여부.
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ops, useOps } from './store.js'
import { Switch, useL, won } from './ui.jsx'

const isAdded = (p) => p.id.startsWith('p-')

export default function Products() {
  const L = useL()
  const products = useOps((s) => s.products)
  const [draft, setDraft] = useState({ ko: '', en: '', cuts: 4, prints: 2, price: 7000 })
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const valid = draft.ko.trim() && draft.price >= 0

  const add = (e) => {
    e.preventDefault()
    if (!valid) return
    const ko = draft.ko.trim()
    ops.addProduct({ id: `p-${Date.now().toString(36)}`, name: { ko, en: draft.en.trim() || ko }, cuts: draft.cuts, prints: draft.prints, price: Math.round(draft.price / 100) * 100 })
    setDraft({ ko: '', en: '', cuts: 4, prints: 2, price: 7000 })
  }

  return (
    <div className="op-stack">
      <section className="op-card" aria-label={L('Products and prices', '상품과 가격표')}>
        <div className="op-card-head">
          <h3 className="op-h3">{L('Products and prices', '상품과 가격표')}</h3>
          <span className="op-meta">{L('Edit a cell and it applies to the kiosks at once.', '수정 즉시 키오스크 반영')}</span>
        </div>
        <div className="op-table-wrap">
          <table className="op-table op-table-edit">
            <thead>
              <tr>
                <th scope="col">{L('Name (KO)', '이름(한글)')}</th>
                <th scope="col">{L('Name (EN)', '이름(영문)')}</th>
                <th scope="col">{L('Cuts', '컷')}</th>
                <th scope="col">{L('Prints', '인화')}</th>
                <th scope="col" className="op-right">{L('Price (KRW)', '가격(원)')}</th>
                <th scope="col">{L('On sale', '판매')}</th>
                <th scope="col"><span className="op-sr">{L('Delete', '삭제')}</span></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={p.enabled ? '' : 'op-off-row'}>
                  <td>
                    <input aria-label={`${p.name.ko} ${L('name (KO)', '이름(한글)')}`} value={p.name.ko} onChange={(e) => ops.setProduct(p.id, { name: { ...p.name, ko: e.target.value } })} />
                  </td>
                  <td>
                    <input aria-label={`${p.name.ko} ${L('name (EN)', '이름(영문)')}`} value={p.name.en} onChange={(e) => ops.setProduct(p.id, { name: { ...p.name, en: e.target.value } })} />
                  </td>
                  <td>
                    <select aria-label={`${p.name.ko} ${L('cuts', '컷 수')}`} value={p.cuts} onChange={(e) => ops.setProduct(p.id, { cuts: Number(e.target.value) })}>
                      <option value={4}>4</option>
                      <option value={8}>8</option>
                    </select>
                  </td>
                  <td>
                    <input className="op-in-sm" type="number" min={1} max={10} aria-label={`${p.name.ko} ${L('prints', '인화 장수')}`} value={p.prints} onChange={(e) => ops.setProduct(p.id, { prints: Math.max(1, Number(e.target.value) || 1) })} />
                  </td>
                  <td>
                    <input className="op-in-price op-right op-num" type="number" min={0} step={500} aria-label={`${p.name.ko} ${L('price', '가격')}`} value={p.price} onChange={(e) => ops.setProduct(p.id, { price: Math.max(0, Number(e.target.value) || 0) })} />
                  </td>
                  <td>
                    <Switch checked={p.enabled} onChange={(v) => ops.setProduct(p.id, { enabled: v })} label={`${p.name.ko} ${L('on sale', '판매')}`} />
                  </td>
                  <td>
                    {isAdded(p) ? (
                      <button type="button" className="op-icon-btn" aria-label={`${p.name.ko} ${L('delete', '삭제')}`} onClick={() => ops.removeProduct(p.id)}>
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="op-meta">
          {L('Lowest price on sale', '판매 중 가장 낮은 가격')}: <span className="op-num">{products.some((p) => p.enabled) ? won(Math.min(...products.filter((p) => p.enabled).map((p) => p.price))) : '—'}</span>
        </p>
      </section>

      <section className="op-card" aria-label={L('Add a product', '상품 추가')}>
        <h3 className="op-h3">{L('Add a product', '상품 추가')}</h3>
        <form className="op-form op-form-4" onSubmit={add}>
          <label className="op-field">
            <span>{L('Name (KO)', '이름(한글)')}</span>
            <input value={draft.ko} onChange={(e) => set('ko', e.target.value)} placeholder={L('e.g. Couple 8-cut', '예: 커플 8컷')} />
          </label>
          <label className="op-field">
            <span>{L('Name (EN, optional)', '이름(영문, 비워도 됨)')}</span>
            <input value={draft.en} onChange={(e) => set('en', e.target.value)} />
          </label>
          <label className="op-field">
            <span>{L('Cuts', '컷 수')}</span>
            <select value={draft.cuts} onChange={(e) => set('cuts', Number(e.target.value))}>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </label>
          <label className="op-field">
            <span>{L('Prints', '인화 장수')}</span>
            <input type="number" min={1} max={10} value={draft.prints} onChange={(e) => set('prints', Math.max(1, Number(e.target.value) || 1))} />
          </label>
          <label className="op-field">
            <span>{L('Price (KRW)', '가격(원)')}</span>
            <input type="number" min={0} step={500} value={draft.price} onChange={(e) => set('price', Math.max(0, Number(e.target.value) || 0))} />
          </label>
          <button type="submit" className="op-btn op-self-end" disabled={!valid}>
            <Plus size={16} aria-hidden="true" />
            {L('Add', '추가')}
          </button>
        </form>
      </section>
    </div>
  )
}
