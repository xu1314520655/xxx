export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  technicalPoints: string[];
  tasks: string[];
  sampleCode: string;
  dataSchema: {
    columns: string[];
    types: string[];
  };
}

export const projects: Project[] = [
  {
    id: '1',
    title: '电商订单数据清洗与质量评估',
    description: '某电商平台订单表含缺失值、异常值、重复记录，需要进行数据清洗和质量评估。',
    difficulty: 'beginner',
    technicalPoints: [
      'pd.read_csv() 与参数调优',
      '缺失值识别与处理（isna(), fillna(), dropna()）',
      '异常值检测（IQR规则、业务逻辑阈值）',
      '重复数据去重（duplicated(), drop_duplicates()）',
      '数据类型转换（astype(), pd.to_datetime()）'
    ],
    tasks: [
      '加载数据，输出清洗前后数据质量报告（缺失率、异常值数量）。',
      '清洗后保存为新文件。'
    ],
    sampleCode: `import pandas as pd
import numpy as np

# 生成模拟数据
data = {
    'order_id': range(1, 101),
    'customer_id': np.random.randint(1, 50, 100),
    'order_date': pd.date_range('2024-01-01', periods=100),
    'amount': np.random.uniform(10, 1000, 100),
    'status': np.random.choice(['completed', 'pending', 'cancelled'], 100)
}

# 添加缺失值
data['amount'][::10] = np.nan
data['customer_id'][::15] = np.nan

# 添加异常值
data['amount'][::20] = 99999

# 添加重复记录
df = pd.DataFrame(data)
df = pd.concat([df, df.iloc[0:5]], ignore_index=True)

print('原始数据形状:', df.shape)
print('\n数据质量报告:')
print('缺失值统计:')
print(df.isna().sum())
print('\n重复记录数:', df.duplicated().sum())
print('\n异常值检测（金额>5000）:', (df['amount'] > 5000).sum())

# 数据清洗
# 1. 去重
df_clean = df.drop_duplicates()

# 2. 处理缺失值
df_clean['amount'] = df_clean['amount'].fillna(df_clean['amount'].mean())
df_clean['customer_id'] = df_clean['customer_id'].fillna(0).astype(int)

# 3. 处理异常值
df_clean['amount'] = np.where(df_clean['amount'] > 5000, df_clean['amount'].mean(), df_clean['amount'])

# 4. 数据类型转换
df_clean['order_date'] = pd.to_datetime(df_clean['order_date'])

print('\n清洗后数据形状:', df_clean.shape)
print('清洗后缺失值统计:')
print(df_clean.isna().sum())
print('\n清洗后异常值检测（金额>5000）:', (df_clean['amount'] > 5000).sum())

# 保存清洗后的数据
df_clean.to_csv('cleaned_orders.csv', index=False)
print('\n数据已保存为 cleaned_orders.csv')`,
    dataSchema: {
      columns: ['order_id', 'customer_id', 'order_date', 'amount', 'status'],
      types: ['int', 'int', 'datetime', 'float', 'string']
    }
  },
  {
    id: '2',
    title: '用户行为日志解析与特征工程',
    description: '用户点击流日志（时间戳、URL、用户ID），需提取行为特征。',
    difficulty: 'beginner',
    technicalPoints: [
      '时间序列处理（提取小时、星期、是否为周末）',
      '字符串解析（str.extract() 从URL提取页面类型）',
      '分组聚合（groupby + agg 统计PV/UV）',
      '会话划分（按用户ID + 30分钟无操作切分）'
    ],
    tasks: [
      '构建特征表：每个用户的平均会话时长、深夜访问次数、关键页面访问比例。'
    ],
    sampleCode: `import pandas as pd
import numpy as np

# 生成模拟数据
user_ids = np.random.randint(1, 100, 1000)
timestamps = pd.date_range('2024-01-01 00:00:00', periods=1000, freq='15T')
urls = np.random.choice([
    'https://example.com/home',
    'https://example.com/product/1',
    'https://example.com/product/2',
    'https://example.com/cart',
    'https://example.com/checkout'
], 1000)

df = pd.DataFrame({
    'user_id': user_ids,
    'timestamp': timestamps,
    'url': urls
})

# 提取特征
# 1. 时间特征
df['hour'] = df['timestamp'].dt.hour
df['day_of_week'] = df['timestamp'].dt.dayofweek
df['is_weekend'] = df['day_of_week'].isin([5, 6])

# 2. URL特征
df['page_type'] = df['url'].str.extract(r'https://example\.com/(\w+)')

# 3. 会话划分
# 按用户分组，按时间排序
df = df.sort_values(['user_id', 'timestamp'])

# 计算时间差
df['time_diff'] = df.groupby('user_id')['timestamp'].diff().dt.total_seconds() / 60

# 会话开始标记（首次访问或超过30分钟）
df['session_start'] = (df['time_diff'] > 30) | (df['time_diff'].isna())

# 会话ID
df['session_id'] = df.groupby('user_id')['session_start'].cumsum()

# 4. 会话特征
# 计算每个会话的时长
session_durations = df.groupby(['user_id', 'session_id'])['timestamp'].agg(['min', 'max'])
session_durations['duration'] = (session_durations['max'] - session_durations['min']).dt.total_seconds() / 60

# 平均会话时长
avg_session_duration = session_durations.groupby('user_id')['duration'].mean().reset_index()
avg_session_duration.columns = ['user_id', 'avg_session_duration']

# 深夜访问次数（22点-6点）
late_night_visits = df[(df['hour'] >= 22) | (df['hour'] < 6)].groupby('user_id').size().reset_index()
late_night_visits.columns = ['user_id', 'late_night_visits']

# 关键页面访问比例（购物车和 checkout）
key_pages = df[df['page_type'].isin(['cart', 'checkout'])].groupby('user_id').size().reset_index()
key_pages.columns = ['user_id', 'key_page_visits']
total_visits = df.groupby('user_id').size().reset_index()
total_visits.columns = ['user_id', 'total_visits']

# 合并特征
user_features = avg_session_duration.merge(late_night_visits, on='user_id', how='left')
user_features = user_features.merge(key_pages, on='user_id', how='left')
user_features = user_features.merge(total_visits, on='user_id', how='left')

# 计算比例
user_features['key_page_ratio'] = user_features['key_page_visits'] / user_features['total_visits']

# 填充缺失值
user_features = user_features.fillna(0)

print('用户行为特征表:')
print(user_features.head())

# 保存特征表
user_features.to_csv('user_features.csv', index=False)
print('\n特征表已保存为 user_features.csv')`,
    dataSchema: {
      columns: ['user_id', 'timestamp', 'url'],
      types: ['int', 'datetime', 'string']
    }
  },
  {
    id: '3',
    title: '购物车分析 —— 关联规则挖掘准备',
    description: '交易数据（订单ID，商品名称），需生成频繁项集输入格式。',
    difficulty: 'intermediate',
    technicalPoints: [
      'pandas 数据透视（pivot_table 构造0/1矩阵）',
      '事务数据转换为项集列表（groupby + agg(list)）',
      '计算支持度（向量化操作避免循环）',
      '与 mlxtend.frequent_patterns 联动'
    ],
    tasks: [
      '输出每个订单对应的商品列表（逗号分隔）。',
      '生成二元矩阵，计算单项商品支持度，筛选支持度>0.01的商品。'
    ],
    sampleCode: `import pandas as pd
import numpy as np

# 生成模拟数据
order_ids = np.repeat(range(1, 501), np.random.randint(1, 5, 500))
products = np.random.choice([
    '牛奶', '面包', '鸡蛋', '苹果', '香蕉',
    '橙子', '西红柿', '土豆', '鸡肉', '牛肉'
], len(order_ids))

df = pd.DataFrame({
    'order_id': order_ids,
    'product': products
})

print('原始交易数据:')
print(df.head())

# 1. 输出每个订单对应的商品列表
order_products = df.groupby('order_id')['product'].agg(list).reset_index()
order_products['product_list'] = order_products['product'].apply(lambda x: ','.join(x))
print('\n每个订单的商品列表:')
print(order_products[['order_id', 'product_list']].head())

# 2. 生成二元矩阵（one-hot编码）
binary_matrix = pd.crosstab(df['order_id'], df['product']).astype(bool).astype(int)
print('\n二元矩阵形状:', binary_matrix.shape)
print('二元矩阵前5行:')
print(binary_matrix.head())

# 3. 计算单项商品支持度
support = binary_matrix.mean().sort_values(ascending=False)
print('\n商品支持度:')
print(support)

# 4. 筛选支持度>0.01的商品
filtered_products = support[support > 0.01].index.tolist()
filtered_matrix = binary_matrix[filtered_products]
print('\n筛选后商品数量:', len(filtered_products))
print('筛选后商品:', filtered_products)

# 保存结果
order_products.to_csv('order_products.csv', index=False)
binary_matrix.to_csv('binary_matrix.csv')
print('\n结果已保存为 order_products.csv 和 binary_matrix.csv')

# 注意：实际使用 mlxtend 进行关联规则挖掘需要安装该库
# from mlxtend.frequent_patterns import apriori, association_rules
# frequent_itemsets = apriori(filtered_matrix, min_support=0.01, use_colnames=True)
# rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.5)
# print(rules.head())`,
    dataSchema: {
      columns: ['order_id', 'product'],
      types: ['int', 'string']
    }
  },
  {
    id: '4',
    title: 'RFM客户价值分群',
    description: '零售交易记录（客户ID，交易日期，金额），基于RFM模型进行客户分群。',
    difficulty: 'intermediate',
    technicalPoints: [
      '计算最近购买时间、频率、金额',
      'pd.cut() 实现评分分层（1-5分）',
      '客户分群规则（高价值、唤醒、流失等）',
      '可视化：分群占比饼图、雷达图'
    ],
    tasks: [
      '将客户分为8类（如“重要价值客户”“一般发展客户”），输出每类人数与贡献金额占比。'
    ],
    sampleCode: `import pandas as pd
import numpy as np
from datetime import datetime

# 生成模拟数据
customer_ids = np.random.randint(1, 201, 1000)
dates = pd.date_range('2023-01-01', '2023-12-31', periods=1000)
amounts = np.random.uniform(50, 1000, 1000)

df = pd.DataFrame({
    'customer_id': customer_ids,
    'transaction_date': dates,
    'amount': amounts
})

# 设置当前日期为2024-01-01
current_date = pd.to_datetime('2024-01-01')

# 计算RFM值
rfm = df.groupby('customer_id').agg({
    'transaction_date': lambda x: (current_date - x.max()).days,  # Recency
    'customer_id': 'count',  # Frequency
    'amount': 'sum'  # Monetary
}).rename(columns={
    'transaction_date': 'Recency',
    'customer_id': 'Frequency',
    'amount': 'Monetary'
})

# 评分（1-5分，5分最好）
rfm['R_score'] = pd.cut(rfm['Recency'], 5, labels=[5, 4, 3, 2, 1])
rfm['F_score'] = pd.cut(rfm['Frequency'], 5, labels=[1, 2, 3, 4, 5])
rfm['M_score'] = pd.cut(rfm['Monetary'], 5, labels=[1, 2, 3, 4, 5])

# 转换为整数
rfm['R_score'] = rfm['R_score'].astype(int)
rfm['F_score'] = rfm['F_score'].astype(int)
rfm['M_score'] = rfm['M_score'].astype(int)

# 客户分群规则
def segment_customer(row):
    r, f, m = row['R_score'], row['F_score'], row['M_score']
    
    if r >= 4 and f >= 4 and m >= 4:
        return '重要价值客户'
    elif r >= 4 and f >= 2 and m >= 2:
        return '重要发展客户'
    elif r >= 4 and f < 2 and m >= 2:
        return '重要挽留客户'
    elif r >= 2 and f >= 4 and m >= 4:
        return '一般价值客户'
    elif r >= 2 and f >= 2 and m >= 2:
        return '一般发展客户'
    elif r >= 2 and f < 2 and m >= 2:
        return '一般挽留客户'
    elif r < 2 and f >= 2 and m >= 2:
        return '低价值客户'
    else:
        return '流失客户'

rfm['Segment'] = rfm.apply(segment_customer, axis=1)

# 计算每类人数与贡献金额占比
segment_stats = rfm.groupby('Segment').agg({
    'Recency': 'count',  # 人数
    'Monetary': 'sum'     # 总金额
}).rename(columns={'Recency': 'Count'})

segment_stats['Count_Percentage'] = segment_stats['Count'] / segment_stats['Count'].sum() * 100
segment_stats['Monetary_Percentage'] = segment_stats['Monetary'] / segment_stats['Monetary'].sum() * 100

print('客户分群统计:')
print(segment_stats)

# 保存结果
rfm.to_csv('rfm_analysis.csv')
segment_stats.to_csv('segment_stats.csv')
print('\n结果已保存为 rfm_analysis.csv 和 segment_stats.csv')`,
    dataSchema: {
      columns: ['customer_id', 'transaction_date', 'amount'],
      types: ['int', 'datetime', 'float']
    }
  },
  {
    id: '5',
    title: '时间序列分析 —— 销售趋势与异常检测',
    description: '日销售数据（日期，销售额），含节假日标识，进行趋势分析和异常检测。',
    difficulty: 'intermediate',
    technicalPoints: [
      '重采样（resample(\'W\') 周趋势）',
      '滑动窗口统计（rolling 计算7日移动平均）',
      '同比/环比计算（shift）',
      '基于Z-score的异常检测'
    ],
    tasks: [
      '绘制原始序列 + 移动平均线。',
      '标记异常点（超出3倍标准差）。',
      '输出节假日对销售的拉动系数。'
    ],
    sampleCode: `import pandas as pd
import numpy as np

# 生成模拟数据
dates = pd.date_range('2023-01-01', '2023-12-31', freq='D')
base_sales = 1000 + np.sin(np.arange(len(dates)) / 30 * 2 * np.pi) * 200
trend = np.arange(len(dates)) * 2
noise = np.random.normal(0, 100, len(dates))
sales = base_sales + trend + noise

# 添加节假日效应
holidays = ['2023-01-01', '2023-02-14', '2023-04-01', '2023-05-01', 
            '2023-06-01', '2023-09-01', '2023-10-01', '2023-12-25']
holiday_indices = [dates.get_loc(date) for date in holidays]
sales[holiday_indices] *= 1.5

# 添加异常值
sales[::60] *= 2  # 每60天添加一个异常值

df = pd.DataFrame({
    'date': dates,
    'sales': sales,
    'is_holiday': dates.isin(pd.to_datetime(holidays))
})

# 设置日期为索引
df.set_index('date', inplace=True)

# 1. 重采样（周趋势）
weekly_sales = df['sales'].resample('W').mean()

# 2. 计算7日移动平均
df['moving_average'] = df['sales'].rolling(window=7).mean()

# 3. 计算同比/环比
# 环比（与前一天相比）
df['mom'] = df['sales'] / df['sales'].shift(1) - 1
# 同比（与去年同期相比）
df['yoy'] = df['sales'] / df['sales'].shift(365) - 1

# 4. 异常检测（基于Z-score）
mean_sales = df['sales'].mean()
std_sales = df['sales'].std()
df['z_score'] = (df['sales'] - mean_sales) / std_sales
df['is_anomaly'] = abs(df['z_score']) > 3

# 5. 节假日拉动系数
holiday_sales = df[df['is_holiday']]['sales'].mean()
non_holiday_sales = df[~df['is_holiday']]['sales'].mean()
pull_factor = holiday_sales / non_holiday_sales

print('销售趋势分析:')
print(f'周平均销售额: {weekly_sales.mean():.2f}')
print(f'7日移动平均销售额: {df["moving_average"].mean():.2f}')
print(f'异常值数量: {df["is_anomaly"].sum()}')
print(f'节假日拉动系数: {pull_factor:.2f}')

# 保存结果
df.to_csv('sales_analysis.csv')
weekly_sales.to_csv('weekly_sales.csv')
print('\n结果已保存为 sales_analysis.csv 和 weekly_sales.csv')`,
    dataSchema: {
      columns: ['date', 'sales', 'is_holiday'],
      types: ['datetime', 'float', 'boolean']
    }
  },
  {
    id: '6',
    title: '用户留存与漏斗分析',
    description: '用户注册及每日登录日志（user_id, date, event_type=signup/login/purchase），进行留存率和漏斗分析。',
    difficulty: 'intermediate',
    technicalPoints: [
      '生成同期群（groupby 获取用户首次注册日期）',
      '计算N日留存率（pivot_table + 自定义留存函数）',
      '漏斗转化：各环节用户数及流失率（cumsum, merge）'
    ],
    tasks: [
      '输出第1、3、7日留存率矩阵（注册日期 vs 留存周期）。',
      '绘制注册→登录→加购→支付的转化漏斗图。'
    ],
    sampleCode: `import pandas as pd
import numpy as np

# 生成模拟数据
# 生成用户ID
user_ids = np.random.randint(1, 1001, 5000)

# 生成日期范围
dates = pd.date_range('2023-01-01', '2023-01-31', periods=5000)

# 生成事件类型
event_types = np.random.choice(['signup', 'login', 'purchase'], 5000, p=[0.1, 0.6, 0.3])

df = pd.DataFrame({
    'user_id': user_ids,
    'date': dates,
    'event_type': event_types
})

# 1. 留存率分析
# 获取每个用户的首次注册日期
user_first_signup = df[df['event_type'] == 'signup'].groupby('user_id')['date'].min().reset_index()
user_first_signup.columns = ['user_id', 'signup_date']

# 合并首次注册日期
df_with_signup = df.merge(user_first_signup, on='user_id', how='left')

# 计算每个用户每天与注册日期的天数差
df_with_signup['day_diff'] = (df_with_signup['date'] - df_with_signup['signup_date']).dt.days

# 过滤掉注册前的记录
df_with_signup = df_with_signup[df_with_signup['day_diff'] >= 0]

# 计算每日活跃用户
active_users = df_with_signup[df_with_signup['event_type'].isin(['login', 'purchase'])].groupby(['signup_date', 'day_diff'])['user_id'].nunique().reset_index()
active_users.columns = ['signup_date', 'day_diff', 'active_users']

# 计算注册用户数
signup_users = df_with_signup[df_with_signup['event_type'] == 'signup'].groupby('signup_date')['user_id'].nunique().reset_index()
signup_users.columns = ['signup_date', 'signup_users']

# 合并计算留存率
retention = active_users.merge(signup_users, on='signup_date', how='left')
retention['retention_rate'] = retention['active_users'] / retention['signup_users'] * 100

# 生成留存率矩阵
retention_pivot = retention.pivot_table(index='signup_date', columns='day_diff', values='retention_rate', fill_value=0)

# 提取第1、3、7日留存率
retention_days = [1, 3, 7]
retention_matrix = retention_pivot[retention_days]
print('留存率矩阵（%）:')
print(retention_matrix)

# 2. 漏斗分析
# 计算各环节用户数
funnel_data = df.groupby('event_type')['user_id'].nunique().reset_index()
funnel_data.columns = ['event_type', 'user_count']

# 按漏斗顺序排序
funnel_order = ['signup', 'login', 'purchase']
funnel_data = funnel_data.set_index('event_type').loc[funnel_order].reset_index()

# 计算转化率和流失率
funnel_data['conversion_rate'] = funnel_data['user_count'] / funnel_data['user_count'].iloc[0] * 100
funnel_data['dropoff_rate'] = 100 - funnel_data['conversion_rate']

print('\n漏斗分析:')
print(funnel_data)

# 保存结果
retention_matrix.to_csv('retention_matrix.csv')
funnel_data.to_csv('funnel_analysis.csv', index=False)
print('\n结果已保存为 retention_matrix.csv 和 funnel_analysis.csv')`,
    dataSchema: {
      columns: ['user_id', 'date', 'event_type'],
      types: ['int', 'datetime', 'string']
    }
  },
  {
    id: '7',
    title: 'A/B测试结果分析（假设检验）',
    description: '实验组与对照组用户的转化率数据（user_id, group, converted），进行假设检验。',
    difficulty: 'intermediate',
    technicalPoints: [
      '分组聚合计算转化率',
      '二项分布置信区间计算（statsmodels.stats.proportion.proportion_confint）',
      '卡方检验（pd.crosstab + chi2_contingency）'
    ],
    tasks: [
      '判断实验组转化率是否显著高于对照组（α=0.05），输出P值及效应量。'
    ],
    sampleCode: `import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency

# 生成模拟数据
# 生成用户ID
user_ids = range(1, 2001)

# 分配实验组和对照组（各1000人）
groups = ['control'] * 1000 + ['treatment'] * 1000

# 生成转化率（对照组10%，实验组15%）
conversion_control = np.random.binomial(1, 0.1, 1000)
conversion_treatment = np.random.binomial(1, 0.15, 1000)
converted = np.concatenate([conversion_control, conversion_treatment])

df = pd.DataFrame({
    'user_id': user_ids,
    'group': groups,
    'converted': converted
})

# 1. 分组聚合计算转化率
conversion_rates = df.groupby('group')['converted'].agg(['count', 'sum', 'mean'])
conversion_rates.columns = ['total_users', 'converted_users', 'conversion_rate']
conversion_rates['conversion_rate'] *= 100

print('转化率分析:')
print(conversion_rates)

# 2. 卡方检验
# 创建列联表
contingency_table = pd.crosstab(df['group'], df['converted'])
print('\n列联表:')
print(contingency_table)

# 执行卡方检验
chi2, p_value, dof, expected = chi2_contingency(contingency_table)
print('\n卡方检验结果:')
print(f'卡方统计量: {chi2:.4f}')
print(f'P值: {p_value:.4f}')
print(f'自由度: {dof}')

# 3. 效应量计算（Cramer's V）
n = contingency_table.sum().sum()
cramers_v = np.sqrt(chi2 / (n * (min(contingency_table.shape) - 1)))

print(f'\n效应量（Cramer\'s V）: {cramers_v:.4f}')

# 4. 结论
if p_value < 0.05:
    print('\n结论：实验组转化率显著高于对照组（α=0.05）')
else:
    print('\n结论：实验组与对照组转化率无显著差异（α=0.05）')

# 保存结果
conversion_rates.to_csv('conversion_rates.csv')
contingency_table.to_csv('contingency_table.csv')
print('\n结果已保存为 conversion_rates.csv 和 contingency_table.csv')`,
    dataSchema: {
      columns: ['user_id', 'group', 'converted'],
      types: ['int', 'string', 'boolean']
    }
  },
  {
    id: '8',
    title: 'K-Means用户聚类（基于消费行为）',
    description: '用户消费特征表（消费总额，频次，最近购买天数，平均客单价），使用K-Means进行聚类分析。',
    difficulty: 'advanced',
    technicalPoints: [
      '数据标准化（sklearn.preprocessing.StandardScaler）',
      '肘部法则确定K值（KMeans.inertia_）',
      '聚类结果分析与可视化（matplotlib 散点图，降维后展示）',
      '轮廓系数评估（silhouette_score）'
    ],
    tasks: [
      '将用户分为3-5类，命名并解释每类特征。',
      '输出每类用户的营销建议。'
    ],
    sampleCode: `import pandas as pd
import numpy as np

# 生成模拟数据
np.random.seed(42)

# 生成4类用户
# 1. 高价值用户：高消费，高频次，最近购买
n_high = 200
high_value = {
    'total_spend': np.random.normal(5000, 1000, n_high),
    'frequency': np.random.normal(20, 5, n_high),
    'recency': np.random.normal(5, 2, n_high),
    'avg_order_value': np.random.normal(250, 50, n_high)
}

# 2. 中等价值用户：中等消费，中等频次
n_medium = 300
medium_value = {
    'total_spend': np.random.normal(2000, 500, n_medium),
    'frequency': np.random.normal(10, 3, n_medium),
    'recency': np.random.normal(15, 5, n_medium),
    'avg_order_value': np.random.normal(200, 40, n_medium)
}

# 3. 低价值用户：低消费，低频次
n_low = 400
low_value = {
    'total_spend': np.random.normal(500, 200, n_low),
    'frequency': np.random.normal(3, 2, n_low),
    'recency': np.random.normal(30, 10, n_low),
    'avg_order_value': np.random.normal(150, 30, n_low)
}

# 4. 新用户：低消费，低频次，最近注册
n_new = 100
new_users = {
    'total_spend': np.random.normal(200, 100, n_new),
    'frequency': np.random.normal(1, 0.5, n_new),
    'recency': np.random.normal(2, 1, n_new),
    'avg_order_value': np.random.normal(200, 50, n_new)
}

# 合并数据
data = pd.DataFrame({**high_value, **medium_value, **low_value, **new_users})
data = data.sample(frac=1).reset_index(drop=True)
data['user_id'] = range(1, len(data) + 1)

print('用户消费特征数据:')
print(data.head())

# 注意：实际使用K-Means需要安装scikit-learn
# from sklearn.preprocessing import StandardScaler
# from sklearn.cluster import KMeans
# from sklearn.metrics import silhouette_score
# import matplotlib.pyplot as plt

# # 数据标准化
# features = data[['total_spend', 'frequency', 'recency', 'avg_order_value']]
# scaler = StandardScaler()
# scaled_features = scaler.fit_transform(features)

# # 肘部法则确定K值
# inertia = []
# for k in range(1, 11):
#     kmeans = KMeans(n_clusters=k, random_state=42)
#     kmeans.fit(scaled_features)
#     inertia.append(kmeans.inertia_)

# # 计算轮廓系数
# silhouette_scores = []
# for k in range(2, 11):
#     kmeans = KMeans(n_clusters=k, random_state=42)
#     labels = kmeans.fit_predict(scaled_features)
#     score = silhouette_score(scaled_features, labels)
#     silhouette_scores.append(score)

# # 选择K=4进行聚类
# kmeans = KMeans(n_clusters=4, random_state=42)
# data['cluster'] = kmeans.fit_predict(scaled_features)

# # 分析聚类结果
# cluster_analysis = data.groupby('cluster').agg({
#     'total_spend': 'mean',
#     'frequency': 'mean',
#     'recency': 'mean',
#     'avg_order_value': 'mean',
#     'user_id': 'count'
# }).round(2)

# print('聚类分析结果:')
# print(cluster_analysis)

# # 营销建议
# cluster_names = {
#     0: '高价值用户',
#     1: '中等价值用户',
#     2: '低价值用户',
#     3: '新用户'
# }

# marketing_advice = {
#     '高价值用户': '提供VIP服务，专属优惠，个性化推荐',
#     '中等价值用户': '定期促销，会员积分，交叉销售',
#     '低价值用户': '唤醒活动，优惠券，简化购买流程',
#     '新用户': '欢迎礼包，首次购买折扣，引导复购'
# }

# print('\n营销建议:')
# for cluster_id, name in cluster_names.items():
#     print(f'{name}: {marketing_advice[name]}')

# 保存数据
data.to_csv('user_clustering_data.csv', index=False)
print('\n数据已保存为 user_clustering_data.csv')`,
    dataSchema: {
      columns: ['user_id', 'total_spend', 'frequency', 'recency', 'avg_order_value'],
      types: ['int', 'float', 'float', 'float', 'float']
    }
  },
  {
    id: '9',
    title: '商品价格带与购物篮大小分析',
    description: '交易明细（商品价格，数量，订单ID），分析价格带和购物篮大小。',
    difficulty: 'intermediate',
    technicalPoints: [
      '计算购物篮总金额、商品数量',
      '分位数划分价格带（qcut）',
      '交叉表分析（pd.crosstab 价格带 vs 是否购买高利润商品）',
      '分组统计：不同购物篮大小对应的平均折扣率'
    ],
    tasks: [
      '输出“小篮（1-2件）”“中篮（3-5件）”“大篮（6件以上）”的订单数及平均客单价。'
    ],
    sampleCode: `import pandas as pd
import numpy as np

# 生成模拟数据
# 生成订单ID
order_ids = np.repeat(range(1, 1001), np.random.randint(1, 10, 1000))

# 生成商品价格
prices = np.random.uniform(10, 1000, len(order_ids))

# 生成商品数量
quantities = np.random.randint(1, 5, len(order_ids))

# 生成是否高利润商品
is_high_profit = np.random.binomial(1, 0.3, len(order_ids))

# 生成折扣率
折扣率 = np.random.uniform(0.8, 1.0, len(order_ids))

df = pd.DataFrame({
    'order_id': order_ids,
    'price': prices,
    'quantity': quantities,
    'is_high_profit': is_high_profit,
    'discount': 折扣率
})

# 计算商品金额
df['item_amount'] = df['price'] * df['quantity'] * df['discount']

# 1. 计算购物篮总金额和商品数量
basket_stats = df.groupby('order_id').agg({
    'item_amount': 'sum',  # 购物篮总金额
    'quantity': 'sum',     # 商品数量
    'is_high_profit': 'max'  # 是否包含高利润商品
}).rename(columns={
    'item_amount': 'basket_total',
    'quantity': 'basket_size',
    'is_high_profit': 'has_high_profit'
})

# 2. 划分购物篮大小

def basket_size_category(size):
    if size <= 2:
        return '小篮（1-2件）'
    elif size <= 5:
        return '中篮（3-5件）'
    else:
        return '大篮（6件以上）'

basket_stats['basket_size_category'] = basket_stats['basket_size'].apply(basket_size_category)

# 3. 分析不同购物篮大小的订单数和平均客单价
basket_analysis = basket_stats.groupby('basket_size_category').agg({
    'basket_total': 'mean',  # 平均客单价
    'basket_size': 'count'   # 订单数
}).rename(columns={
    'basket_total': 'avg_order_value',
    'basket_size': 'order_count'
})

print('购物篮大小分析:')
print(basket_analysis)

# 4. 分位数划分价格带
df['price_band'] = pd.qcut(df['price'], 4, labels=['低价格带', '中低价格带', '中高价格带', '高价格带'])

# 5. 交叉表分析（价格带 vs 是否购买高利润商品）
price_profit_crosstab = pd.crosstab(df['price_band'], df['is_high_profit'], normalize='index') * 100
print('\n价格带与高利润商品购买关系:')
print(price_profit_crosstab)

# 6. 不同购物篮大小对应的平均折扣率
basket_discount = df.merge(basket_stats[['basket_size_category']], on='order_id')
basket_discount_analysis = basket_discount.groupby('basket_size_category')['discount'].mean()
print('\n不同购物篮大小的平均折扣率:')
print(basket_discount_analysis)

# 保存结果
basket_stats.to_csv('basket_stats.csv')
basket_analysis.to_csv('basket_analysis.csv')
print('\n结果已保存为 basket_stats.csv 和 basket_analysis.csv')`,
    dataSchema: {
      columns: ['order_id', 'price', 'quantity', 'is_high_profit', 'discount'],
      types: ['int', 'float', 'int', 'boolean', 'float']
    }
  },
  {
    id: '10',
    title: '完整数据分析报告 —— 电商综合诊断',
    description: '提供订单表、用户表、商品表、评价表（多表关联），进行综合分析。',
    difficulty: 'advanced',
    technicalPoints: [
      '多表合并（merge, concat）',
      '综合运用上述1-9项技术',
      '输出结构化分析报告（Markdown/HTML）',
      '提出数据驱动的业务建议'
    ],
    tasks: [
      '回答：哪个商品类别的复购率最高？哪个时段下单用户流失最严重？',
      '基于聚类结果与购物车分析，设计一个交叉销售策略。',
      '撰写结论页（含可视化图表）。'
    ],
    sampleCode: `import pandas as pd
import numpy as np

# 生成模拟数据

# 1. 用户表
users = pd.DataFrame({
    'user_id': range(1, 501),
    'register_date': pd.date_range('2023-01-01', periods=500),
    'gender': np.random.choice(['男', '女'], 500),
    'age': np.random.randint(18, 60, 500)
})

# 2. 商品表
products = pd.DataFrame({
    'product_id': range(1, 101),
    'product_name': [f'商品{i}' for i in range(1, 101)],
    'category': np.random.choice(['电子产品', '服装', '食品', '家居', '运动'], 100),
    'price': np.random.uniform(50, 1000, 100)
})

# 3. 订单表
order_ids = range(1, 2001)
user_ids = np.random.randint(1, 501, 2000)
order_dates = pd.date_range('2023-01-01', periods=2000)

orders = pd.DataFrame({
    'order_id': order_ids,
    'user_id': user_ids,
    'order_date': order_dates,
    'total_amount': np.random.uniform(100, 2000, 2000)
})

# 4. 订单明细表
order_items = []
for order_id in order_ids:
    num_items = np.random.randint(1, 5)
    for _ in range(num_items):
        order_items.append({
            'order_id': order_id,
            'product_id': np.random.randint(1, 101),
            'quantity': np.random.randint(1, 3),
            'price': np.random.uniform(50, 1000)
        })

order_items = pd.DataFrame(order_items)

# 5. 评价表
reviews = pd.DataFrame({
    'review_id': range(1, 1501),
    'order_id': np.random.randint(1, 2001, 1500),
    'rating': np.random.randint(1, 6, 1500),
    'comment': ['评价内容' for _ in range(1500)]
})

# 数据合并
# 订单与用户合并
order_user = orders.merge(users, on='user_id', how='left')

# 订单明细与商品合并
order_item_product = order_items.merge(products, on='product_id', how='left')

# 订单与订单明细合并
order_detail = orders.merge(order_item_product, on='order_id', how='left')

# 1. 分析哪个商品类别的复购率最高
# 计算每个用户对每个类别的购买次数
user_category_purchases = order_detail.groupby(['user_id', 'category']).size().reset_index(name='purchase_count')

# 复购定义：购买次数 >= 2
repurchase_users = user_category_purchases[user_category_purchases['purchase_count'] >= 2]
repurchase_rate = repurchase_users.groupby('category').size() / user_category_purchases.groupby('category').size() * 100

print('各商品类别的复购率:')
print(repurchase_rate.sort_values(ascending=False))

# 2. 分析哪个时段下单用户流失最严重
# 提取下单小时
order_user['hour'] = order_user['order_date'].dt.hour

# 计算每个小时的下单用户数
hourly_users = order_user.groupby('hour')['user_id'].nunique().reset_index()
hourly_users.columns = ['hour', 'user_count']

# 假设流失率与下单用户数成反比（简化分析）
hourly_users['loss_rate'] = 100 - (hourly_users['user_count'] / hourly_users['user_count'].max() * 100)

print('\n各时段下单用户流失率:')
print(hourly_users.sort_values('loss_rate', ascending=False))

# 3. 基于聚类结果与购物车分析，设计交叉销售策略
# 计算每个类别的平均购买数量和金额
category_stats = order_detail.groupby('category').agg({
    'quantity': 'mean',
    'price': 'mean',
    'order_id': 'nunique'
}).rename(columns={
    'quantity': 'avg_quantity',
    'price': 'avg_price',
    'order_id': 'order_count'
})

print('\n商品类别统计:')
print(category_stats)

# 交叉销售策略示例
print('\n交叉销售策略建议:')
print('1. 电子产品 + 家居: 购买电子产品的用户推荐相关家居配件')
print('2. 服装 + 运动: 购买服装的用户推荐运动装备')
print('3. 食品 + 家居: 购买食品的用户推荐厨房用品')

# 4. 保存数据
users.to_csv('users.csv', index=False)
products.to_csv('products.csv', index=False)
orders.to_csv('orders.csv', index=False)
order_items.to_csv('order_items.csv', index=False)
reviews.to_csv('reviews.csv', index=False)
print('\n数据已保存为 users.csv, products.csv, orders.csv, order_items.csv, reviews.csv')`,
    dataSchema: {
      columns: ['user_id', 'product_id', 'order_id', 'order_date', 'amount', 'category'],
      types: ['int', 'int', 'int', 'datetime', 'float', 'string']
    }
  }
];
