// src/components/CustomTable.jsx
import React from 'react';
import { Trash2 } from 'lucide-react';
import styles from './CustomTable.module.css'; // Importación de tus estilos extraídos

export default function CustomTable({
    data = [],
    columns = [],
    onDelete,
    emptyMessage = "Sin registros"
}) {

    if (!data || data.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                {emptyMessage}
            </div>
        );
    }

    const renderCellValue = (item, col) => {
        const value = col.key.split('.').reduce((acc, part) => acc?.[part], item);

        if (value === undefined || value === null || value === '') {
            return <span className={styles.textMuted}>Sin registrar</span>;
        }

        switch (col.type) {
            case 'date':
                return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

            case 'badge-blue':
                return (
                    <span className={styles.badgeBlue}>
                        {value}
                    </span>
                );

            case 'badge-green':
                return (
                    <span className={styles.badgeGreen}>
                        {value} {col.suffix || ''}
                    </span>
                );

            case 'number':
                return <span>{Number(value).toLocaleString()} {col.suffix || ''}</span>;

            case 'string':
            default:
                if (col.isPrimary) {
                    return <strong className={styles.textBold}>{String(value)}</strong>;
                }
                return <span className={styles.textPrimary}>{String(value)}</span>;
        }
    };

    return (
        <table className={styles.table}>
            <thead>
                <tr className={styles.thRow}>
                    {columns.map((col, index) => (
                        <th key={`th-${col.key}-${index}`} className={styles.th}>
                            {col.header}
                        </th>
                    ))}
                    {onDelete && <th className={styles.thRight}>Acciones</th>}
                </tr>
            </thead>
            <tbody>
                {data.map((item, rowIndex) => {
                    const rowId = item._id || `row-${rowIndex}`;
                    return (
                        <tr key={rowId} className={styles.dataRow}>
                            {columns.map((col, colIndex) => (
                                <td key={`cell-${rowId}-${col.key}-${colIndex}`} className={styles.td}>
                                    {renderCellValue(item, col)}
                                </td>
                            ))}

                            {onDelete && (
                                <td className={styles.tdRight}>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => {
                                            if (confirm('¿Deseas eliminar este registro?')) {
                                                onDelete(item._id);
                                            }
                                        }}
                                    >
                                        <Trash2 size={14} style={{ color: '#ef4444' }} />
                                    </button>
                                </td>
                            )}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    );
}