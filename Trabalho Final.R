# Instalacao das bibliotecas
install.packages('gdata')
install.packages('caret')
install.packages('corrplot')
install.packages('psych')
install.packages("clValid")
install.packages("ggpubr")
install.packages("ggpubr")

# Carregando as bibliotecas
library(gdata)
library(caret)
library(corrplot)
library(psych)
library(tidyverse)
library(factoextra)
library(clValid)
library(rattle)
library(rpart)
library(e1071)
library(arules)
library(arulesViz)
library(datasets)
library(tidyverse)
library(ggpubr)
library(gridExtra)
library(inspectdf)
library(ggfortify)

# Importando a base de dados
wholesale <- read_csv("C:/Users/Pichau/Documents/MBA/Metodo Matriciais e Clusterizacao/Trabalho/Wholesale customers data.csv")
wholesale

# Renomeando a variavel Delicassen para Delicatessen
wholesale <- rename(wholesale, Delicatessen = Delicassen)

# Checando NA's
table(is.na(wholesale))

# Observando a estrutura dos dados
str(wholesale)

# transformando em fatores
wholesale$Channel <- as.factor(wholesale$Channel)
wholesale$Region <- as.factor(wholesale$Region)

# Analisando as estatisticas descritivas
summary(wholesale[,3:8])
describe(wholesale2)

# Fresh possui a maior media seguido de Grocery
# Existe muita discrepancia entre os valores minimos e maximos observados, o que pode gerar vies

# Gerando um arquivo de texto do output 
sink("./output.txt", append = T)
summary(wholesale[,3:8])
sink()

# Analisando se existem outliers
o1 <- ggplot(data=wholesale, aes(y=Fresh)) +
  geom_boxplot(outlier.colour = "red", outlier.shape = 1)
o2 <- ggplot(data=wholesale, aes(y=Milk)) +
  geom_boxplot(outlier.colour = "red", outlier.shape = 1)
o3 <- ggplot(data=wholesale, aes(y=Frozen)) +
  geom_boxplot(outlier.colour = "red", outlier.shape = 1)
o4 <- ggplot(data=wholesale, aes(y=Grocery)) +
  geom_boxplot(outlier.colour = "red", outlier.shape = 1)
o5 <- ggplot(data=wholesale, aes(y=Detergents_Paper)) +
  geom_boxplot(outlier.colour = "red", outlier.shape = 1)
o6 <- ggplot(data=wholesale, aes(y=Delicatessen)) +
  geom_boxplot(outlier.colour = "red", outlier.shape = 1)
grid.arrange(o1,o2,o3,o4,o5,o6)

# Removendo Outliers
# quantos?
str(wholesale)
str(wholesale2)
406-383
383-354
354-344
344-331
331-317
# 440-317 = 123 observacoes removidas
wholesale2 <- wholesale %>% filter(!Fresh >= 30000) #34
wholesale2 <- wholesale2 %>% filter(!Milk >= 15000) #23
wholesale2 <- wholesale2 %>% filter(!Frozen >= 8000) #29
wholesale2 <- wholesale2 %>% filter(!Grocery >= 23000) #10
wholesale2 <- wholesale2 %>% filter(!Detergents_Paper >= 8000) #13
wholesale2 <- wholesale2 %>% filter(!Delicatessen >= 3500) #14

# Boxplot sem outliers
s1 <- ggplot(data=wholesale2, aes(y=Fresh)) +
  geom_boxplot(outlier.colour = "red", outlier.shape = 1)
s2 <- ggplot(data=wholesale2, aes(y=Milk)) +
  geom_boxplot(outlier.colour = "red", outlier.shape = 1)
s3 <- ggplot(data=wholesale2, aes(y=Frozen)) +
  geom_boxplot(outlier.colour = "red", outlier.shape = 1)
s4 <- ggplot(data=wholesale2, aes(y=Grocery)) +
  geom_boxplot(outlier.colour = "red", outlier.shape = 1)
s5 <- ggplot(data=wholesale2, aes(y=Detergents_Paper)) +
  geom_boxplot(outlier.colour = "red", outlier.shape = 1)
s6 <- ggplot(data=wholesale2, aes(y=Delicatessen)) +
  geom_boxplot(outlier.colour = "red", outlier.shape = 1)
grid.arrange(s1,s2,s3,s4,s5,s6)

# Selecionando as observacoes que sao outliers
Fresh.outliers <- wholesale_continuos %>% filter(Fresh >= 30000)
Milk.outliers <- wholesale_continuos %>% filter(Milk >= 15000)
Frozen.outliers <- wholesale_continuos %>% filter(Frozen >= 5=8000)
Grocery.outliers <- wholesale_continuos %>% filter(Grocery >= 23000)
Detergents_Paper.outliers <- wholesale_continuos %>% filter(Detergents_Paper >= 8000)
Delicatessen.outliers <- wholesale_continuos %>% filter(Delicatessen >= 3500)

# Gerando output como texto
sink("./output.txt", append = T)
head(Fresh.outliers)
head(Milk.outliers)
head(Frozen.outliers)
head(Grocery.outliers)
head(Detergents_Paper.outliers)
head(Delicatessen.outliers)
sink()

# criando datasets para a soma de cada tipo de categoria agrupado por Region
wholesale <- data.frame(wholesale)
region_milk <- wholesale2 %>% group_by(Region) %>% summarise(soma=sum(Milk))
region_fresh <- wholesale2 %>% group_by(Region) %>% summarise(soma=sum(Fresh))
region_frozen <- wholesale2 %>% group_by(Region) %>% summarise(soma=sum(Frozen))
region_grocery <- wholesale2 %>% group_by(Region) %>% summarise(soma=sum(Grocery))
region_detergents <- wholesale2 %>% group_by(Region) %>% summarise(soma=sum(Detergents_Paper))
region_delicatessen <- wholesale2 %>% group_by(Region) %>% summarise(soma=sum(Delicatessen))

# Plot regiao
r1 <- ggplot(data=region_milk, aes(x=Region, y=soma, fill=Region)) +
  geom_bar(stat="identity") +
  labs(title="Milk") +
  scale_y_continuous()

r2 <- ggplot(data=region_fresh, aes(x=Region, y=soma, fill=Region)) +
  geom_bar(stat="identity") +
  labs(title="Fresh") +
  scale_y_continuous()

r3 <- ggplot(data=region_frozen, aes(x=Region, y=soma, fill=Region)) +
  geom_bar(stat="identity") +
  labs(title="Frozen") +
  scale_y_continuous()

r4 <- ggplot(data=region_grocery, aes(x=Region, y=soma, fill=Region)) +
  geom_bar(stat="identity") +
  labs(title="Grocery") +
  scale_y_continuous()

r5 <- ggplot(data=region_detergents, aes(x=Region, y=soma, fill=Region)) +
  geom_bar(stat="identity") +
  labs(title="Detergents_paper") +
  scale_y_continuous()

r6 <- ggplot(data=region_delicatessen, aes(x=Region, y=soma, fill=Region)) +
  geom_bar(stat="identity") +
  labs(title="Delicatessen") +
  scale_y_continuous()

grid.arrange(r1, r2, r3, r4, r5, r6, nrow=2)

# Agrupado por Channel
Channel_milk <- wholesale2 %>% group_by(Channel) %>% summarise(soma=sum(Milk))
Channel_fresh <- wholesale2 %>% group_by(Channel) %>% summarise(soma=sum(Fresh))
Channel_frozen <- wholesale2 %>% group_by(Channel) %>% summarise(soma=sum(Frozen))
Channel_grocery <- wholesale2 %>% group_by(Channel) %>% summarise(soma=sum(Grocery))
Channel_detergents <- wholesale2 %>% group_by(Channel) %>% summarise(soma=sum(Detergents_Paper))
Channel_delicatessen <- wholesale2 %>% group_by(Channel) %>% summarise(soma=sum(Delicatessen))

# Plot channel
c1 <- ggplot(data=Channel_milk, aes(x=Channel, y=soma, fill=Channel)) +
  geom_bar(stat="identity") +
  labs(title="Milk") +
  scale_y_continuous()

c2 <- ggplot(data=Channel_fresh, aes(x=Channel, y=soma, fill=Channel)) +
  geom_bar(stat="identity") +
  labs(title="Fresh") +
  scale_y_continuous()

c3 <- ggplot(data=Channel_frozen, aes(x=Channel, y=soma, fill=Channel)) +
  geom_bar(stat="identity") +
  labs(title="Frozen") +
  scale_y_continuous()

c4 <- ggplot(data=Channel_grocery, aes(x=Channel, y=soma, fill=Channel)) +
  geom_bar(stat="identity") +
  labs(title="Grocery") +
  scale_y_continuous()

c5 <- ggplot(data=Channel_detergents, aes(x=Channel, y=soma, fill=Channel)) +
  geom_bar(stat="identity") +
  labs(title="Detergents_paper") +
  scale_y_continuous()

c6 <- ggplot(data=Channel_delicatessen, aes(x=Channel, y=soma, fill=Channel)) +
  geom_bar(stat="identity") +
  labs(title="Delicatessen") +
  scale_y_continuous()

grid.arrange(c1, c2, c3, c4, c5, c6, nrow=2)

# Separando as variaveis continuas das discretas
wholesale_continuos <- wholesale2 %>% select(-Region, -Channel)
discrete <- wholesale2 %>% select(c("Channel", "Region"))

# todas as variaveis estao enviesadas a esquerda
p1 <- wholesale2 %>% ggplot(aes(x=Fresh)) + geom_density() + ggtitle("Fresh's density")
p2 <- wholesale2 %>% ggplot(aes(x=Milk)) + geom_density() + ggtitle("Milk's density")
p3 <- wholesale2 %>% ggplot(aes(x=Grocery)) + geom_density() + ggtitle("Grocery's density")
p4 <- wholesale2 %>% ggplot(aes(x=Frozen)) + geom_density() + ggtitle("Frozen's density")
p5 <- wholesale2 %>% ggplot(aes(x=Detergents_Paper)) + geom_density() + ggtitle("Deter_Paper's density")
p6 <- wholesale2 %>% ggplot(aes(x=Delicatessen)) + geom_density() + ggtitle("Delicassen's density")
grid.arrange(p1, p2, p3, p4, p5, p6, nrow=2)

# Aplicando log para contornar o vies
continuos <- wholesale_continuos %>% log()
wholesale_log <- cbind(discrete, continuos)
colnames(wholesale_log)

# Plotando a densidade de cada tipo de produto com log
p1 <- wholesale_log %>% ggplot(aes(x=Fresh)) + geom_density() + ggtitle("Fresh's density")
p2 <- wholesale_log %>% ggplot(aes(x=Milk)) + geom_density() + ggtitle("Milk's density")
p3 <- wholesale_log %>% ggplot(aes(x=Grocery)) + geom_density() + ggtitle("Grocery's density")
p4 <- wholesale_log %>% ggplot(aes(x=Frozen)) + geom_density() + ggtitle("Frozen's density")
p5 <- wholesale_log %>% ggplot(aes(x=Detergents_Paper)) + geom_density() + ggtitle("Deter_Paper's density")
p6 <- wholesale_log %>% ggplot(aes(x=Delicatessen)) + geom_density() + ggtitle("Delicassen's density")
grid.arrange(p1, p2, p3, p4, p5, p6, nrow=2)

# Descrições estatísticas
describe(wholesale)
describe(wholesale_log)

# Fresh possui a maior media, seguido de Grocery

# Correlacao entre as variaveis
correlacao <- cor(continuos)
corrplot(correlacao, order = "hclust")

# grocery e milk - alta
# grocery e detergent - muito alta
# milk e detergent - alta

# frozen e fresh - fraca
# delicassen e milk - fraca
# frozen e delicassen - fraca


# Apontar as correlacoes

pairs.panels(wholesale2[,c(-1,-2)], 
             method = "pearson", # correlation method
             hist.col = "#00AFBB",
             density = TRUE,  # show density plots
             ellipses = TRUE # show correlation ellipses
)

# Outra forma de visualizar a correlacao
wholesale_continuos  %>% inspect_cor(alpha=0.05)  %>% arrange(desc(p_value))  %>% show_plot()

# Criando uma nova categoria 
# Channels:
# 1 <- Hotel, Restaurant, Coffee (HRC)
# 2 <- Other
# Region:
# 1 <- Lisbon
# 2 <- Porto
# 3 <- Other
#wholesale_log$channel_per_region[wholesale_log$Channel == "1" & wholesale_log$Region == "1"] = "HRCLisbon"
#wholesale_log$channel_per_region[wholesale_log$Channel == "1" & wholesale_log$Region == "2"] = "HRCPorto"
#wholesale_log$channel_per_region[wholesale_log$Channel == "1" & wholesale_log$Region == "3"] = "HRCOther"
#wholesale_log$channel_per_region[wholesale_log$Channel == "2" & wholesale_log$Region == "1"] = "otherLisbon"
#wholesale_log$channel_per_region[wholesale_log$Channel == "2" & wholesale_log$Region == "2"] = "otherPorto"
#wholesale_log$channel_per_region[wholesale_log$Channel == "2" & wholesale_log$Region == "3"] = "otherther"

#wholesale_log$channel_per_region <- as.factor(wholesale_log$channel_per_region)

#wholesale_continuos

#wholesale_continuos$channel_per_region[wholesale_log$Channel == "1" & wholesale_log$Region == "1"] = "HRCLisbon"
#wholesale_continuos$channel_per_region[wholesale_log$Channel == "1" & wholesale_log$Region == "2"] = "HRCPorto"
#wholesale_continuos$channel_per_region[wholesale_log$Channel == "1" & wholesale_log$Region == "3"] = "HRCOther"
#wholesale_continuos$channel_per_region[wholesale_log$Channel == "2" & wholesale_log$Region == "1"] = "otherLisbon"
#wholesale_continuos$channel_per_region[wholesale_log$Channel == "2" & wholesale_log$Region == "2"] = "otherPorto"
#wholesale_continuos$channel_per_region[wholesale_log$Channel == "2" & wholesale_log$Region == "3"] = "otherther"

#wholesale_continuos$channel_per_region <- as.factor(wholesale_log$channel_per_region)

# Reduzindo a dimensionalidade
channels <- wholesale2$Channel
pca <- prcomp(wholesale_continuos, scale=TRUE, center=TRUE)
pca
summary(pca)
pca_df <- data.frame(x=pca$x[,"PC1"], y=pca$x[,"PC2"], channel=channels)

# Plotando as direcoes de maior variancia
ggplot(data = pca_df, aes(x,y, color=channel)) + 
  geom_point() + xlab("PC1") + ylab("PC2")

# Com mais informacoes - colorido por Channel
autoplot(pca, data=wholesale2, 
         loadings = T, loadings.label = T, colour = "Channel",
         loadings.label.size=2.5,
         loadings.colour = "pink",
         main = "Resultado do PCA - Wholesale Dataset", alpha = 0.4)

# Pode-se observar a separacao em 2 clusters. Um contendo Milk, Grocery e Detergents_Paper indicando ser 
# um cliente Retail (varejista) e o outro contendo os itens Delicassen, Fresh, Frozen o que indica 
# ser um cliente HRC (Hotel, Restaurants ou coffee)

# Com mais informacoes - colorido por channel_per_region
autoplot(pca, data=wholesale_log, 
         loadings = T, loadings.label = T, colour = "channel_per_region",
         loadings.label.size=2.5,
         loadings.colour = "pink",
         main = "pca result of wholesale data", alpha = 0.4)

# Plotando a variancia acumulada
fviz_eig(pca,addlabels=TRUE)

# os dois primeiros componentes contem 72,5% (44.1+28.4) da variância acumulada dos dados, o que ja e suficiente para trabalharmos
# vale observa a queda em formato de cotovelo no PC3 o que indica que nao havera um ganho muito siginificativo com o PC3 em diante

# Contributions of variables to PC1
fviz_contrib(pca, choice = "var", axes = 1, top = 10)
fviz_contrib(pca, choice = "var", axes = 2, top = 25)
fviz_contrib(pca, choice = "var", axes = 3, top = 25)
fviz_contrib(pca, choice = "var", axes = 4, top = 25)
# aqui podemos ver que a dimensao 1 com Grocery, Detergents_Paper e Milk e a dimensão 2 Delicatessen, Frozen e Fresh

# Contributions of variables to PC1 and PC2
fviz_contrib(pca, choice = "var", axes = 1:4, top = 25)

# um cluster mesclado seria Grocery, Detergents_Paper e Milk. Ou seja, 
# um cliente mais proximo do PC1 e PC2 tera maior chance de consumir estes produtos

df_pca_4 <- pca$x[,1:4]

# Escolhendo o numero de clusters
fviz_nbclust(df_pca_4, kmeans, method = "wss")
fviz_nbclust(df_pca_4, kmeans, method = "silhouette")

# Analisando a silhueta
km.res5clusterse4dimensoes <- eclust(pca$x[,1:4], "kmeans", k = kClusters5, graph = FALSE, stand=FALSE, iter.max = 100, 
                 nstart = 100) # Visualize k-means clusters

# nao funciona com fviz_cluster 
km.res2clusterse4dimensoes <- eclust(pca$x[,1:4], "kmeans", k = kClusters2, graph = FALSE, stand=FALSE, iter.max = 100, 
                                     nstart = 100)

# analisando a silhueta pelo modelo da funcao eclust
fviz_silhouette(km.res5clusterse4dimensoes, palette = "jco", ggtheme = theme_classic()) # 0.29
fviz_silhouette(km.res2clusterse4dimensoes, palette = "jco", ggtheme = theme_classic()) # 0.37

# Escolhendo o numero de clusters pela silhueta
fviz_nbclust(df_pca_4, kmeans, method = "silhouette")

# Agrupando com K-Means
# 2 e 5 comparar
kClusters2 <- 2
kClusters5 <- 5

# Modelo K-means
set.seed(123)
km.res2dime5cl <- kmeans(pca$x[,1:2], centers = kClusters5, iter.max = 100, nstart = 100)
km.res2dime2cl <- kmeans(pca$x[,1:2], centers = kClusters2, iter.max = 100, nstart = 100)

km.res4dime5cl <- kmeans(pca$x[,1:4], centers = kClusters5, iter.max = 100, nstart = 100)
km.res4dime2cl <- kmeans(pca$x[,1:4], centers = kClusters2, iter.max = 100, nstart = 100)

wholesale2$cluster <- km.res4dime2cl$cluster

# Comparando o modelo k-means com 2 clusters com o labels originais de Channel
table(wholesale2$cluster == wholesale2$Channel)

ggplot() +
  geom_point(aes(x=pca_df[, 1], y=pca_df[, 2], color=factor(km.res4dime5cl$cluster))) + 
  #geom_text(aes(x=pca_df[, 1], y=pca_df[, 2], label=pca_df[,3])) +
  geom_point(aes(x=km.res4dime5cl$centers[, 1], y=km.res4dime5cl$centers[, 2]), color="black", size=5, shape=4, stroke=2) +
  scale_color_discrete(name = "Clusters")

ggplot() +
  geom_point(aes(x=pca_df[, 1], y=pca_df[, 2], color=factor(km.res4dime2cl$cluster))) + 
  #geom_text(aes(x=pca_df[, 1], y=pca_df[, 2], label=pca_df[,3])) +
  geom_point(aes(x=km.res4dime2cl$centers[, 1], y=km.res4dime2cl$centers[, 2]), color="black", size=5, shape=4, stroke=2) +
  scale_color_discrete(name = "Clusters")


# usar 1 e 2 dim
t1 <- fviz_cluster(km.res4dime5cl, 
             data = wholesale2[,c(-1,-2)],
             #ellipse.type = "euclid", 
             ggtheme = theme_minimal(),main="Gráfico de clusters para k = 5 e 4 dimensões")
t2 <- fviz_cluster(km.res4dime2cl, 
                   data = pca$x[,1:2],
                   #ellipse.type = "euclid", 
                   ggtheme = theme_minimal(),main="Gráfico de clusters para k = 5 e 4 dimensões")
t3 <- fviz_cluster(km.res2dime5cl, 
                   data = pca$x[,1:2],
                   #ellipse.type = "euclid", 
                   ggtheme = theme_minimal(),main="Gráfico de clusters para k = 5 e 2 dimensões")
t4 <- fviz_cluster(km.res2dime2cl, 
                   data = pca$x[,1:2],
                   #ellipse.type = "euclid", 
                   ggtheme = theme_minimal(),main="Gráfico de clusters para k = 2 e 2 dimensões")
grid.arrange(t1,t2, nrow=2)

# Compra media anual para cada cluster
media2dim5cl <- wholesale_continuos  %>% mutate(Cluster = km.res2dime5cl$cluster)  %>% 
  group_by(Cluster)  %>% 
  summarise_all("mean")
media2dim5cl

media2dim2cl <- wholesale_continuos[,1:6]  %>% mutate(Cluster = km.res2dime2cl$cluster)  %>% 
  group_by(Cluster)  %>% 
  summarise_all("mean")
media2dim2cl

media4dim5cl <- wholesale_continuos[,1:6]  %>% mutate(Cluster = km.res4dime5cl$cluster)  %>% 
  group_by(Cluster)  %>% 
  summarise_all("mean")
media4dim5cl

media4dim2cl <- wholesale_continuos[,1:6]  %>% mutate(Cluster = km.res4dime2cl$cluster)  %>% 
  group_by(Cluster)  %>% 
  summarise_all("mean")
media4dim2cl

# gerando output em formato de texto
sink("./output.txt", append = T)
media2dim5cl
media2dim2cl
media4dim5cl
media4dim2cl
sink()

# criando os labels
wholesale_continuos['label5cl'] <- factor(km.res4dime5cl$cluster)
wholesale_continuos['label2cl'] <- factor(km.res4dime2cl$cluster)

# comparando clusters
# Analisando a importancia de cada categoria para cada um dos 5 clusters
wholesale_continuos %>%
  gather(Attributes, value, 1:6) %>% # ver as colunas dos dados 
  ggplot(aes(x=value, fill=label5cl, color=label5cl)) +
  #geom_histogram(binwidth=1, alpha=.5, position="identity") +
  geom_density(alpha=.5) +
  facet_wrap(~Attributes, scales="free") +
  labs(x="Values", y="Frequency") 

# Boxplot
wholesale_continuos %>%
  gather(Attributes, value, 1:6) %>%
  ggplot(aes(x=value, fill=label5cl, color=label5cl)) +
  #geom_histogram(binwidth=1, alpha=.5, position="identity") +
  geom_boxplot(alpha=.5) +
  facet_wrap(~Attributes, scales="free") +
  labs(x="Values", y="Frequency")

# Analisando a importancia de cada categoria para os 2 clusters
wholesale_continuos %>%
  gather(Attributes, value, 1:6) %>% # ver as colunas dos dados 
  ggplot(aes(x=value, fill=label2cl, color=label2cl)) +
  #geom_histogram(binwidth=1, alpha=.5, position="identity") +
  geom_density(alpha=.5) +
  facet_wrap(~Attributes, scales="free") +
  labs(x="Values", y="Frequency") 

# Boxplot
wholesale_continuos %>%
  gather(Attributes, value, 1:6) %>%
  ggplot(aes(x=value, fill=label2cl, color=label2cl)) +
  #geom_histogram(binwidth=1, alpha=.5, position="identity") +
  geom_boxplot(alpha=.5) +
  facet_wrap(~Attributes, scales="free") +
  labs(x="Values", y="Frequency")

# Clusterizacao Hierarquica sem PCA
wholesale_scale <- scale(wholesale_continuos)
res.dist <- dist(wholesale_scale, method = "euclidean")
res.hc <- hclust(d = res.dist, method = "centroid") 
grp <- cutree(res.hc, k=2)
fviz_cluster(list(data=wholesale_continuos, cluster= grp), main = "HCluster Plot sem PCA")

# Clusterizacao Hierarquica com PCA
res.dist <- dist(df_pca_4, method = "euclidean") 
res.hc <- hclust(d = res.dist, method = "ward.D2") # centroid e single s�o os melhores m�todos com base na compara��o com labels originais
#res.hc <- hclust(d = res.dist, method = "centroid") 
#res.hc <- hclust(d = res.dist, method = "single") 
#res.hc <- hclust(d = res.dist, method = "complete") 

# Porem a visualizacao dos clusters fica comprometida, por isso vamos usar ward.D2

# Cortando a arvore para k=2 e k=5 e visualizando os clusters obtidos
grp2 <- cutree(res.hc, k=2)
fviz_cluster(list(data=pca$x, cluster= grp2), main = "HCluster Plot com PCA")

grp5 <- cutree(res.hc, k=5)
fviz_cluster(list(data=pca$x, cluster= grp5), main = "HCluster Plot com PCA")

# Comparando com labels originais
table(grp2 == wholesale2$Channel)

# Analisando o numero otimo de cluster pelo metodo da silhueta para clusterizacao hierarquica (hcut)
fviz_nbclust(pca$x[,1:4], hcut, method = "silhouette")

# plotando o dendograma para k=2 e k=5
fviz_dend(res.hc, 
          k = 2,
          cex = 0.5, 
          color_labels_by_k = TRUE,
          rect = TRUE, show_labels = TRUE)

fviz_dend(res.hc, 
          k = 5,
          cex = 0.5, 
          color_labels_by_k = TRUE,
          rect = TRUE, show_labels = TRUE)

# Analisando a silhueta
hc5 <- eclust(pca$x[,1:4], "hclust", k = kClusters5, graph = FALSE, stand=FALSE, iter.max = 100, 
                                     nstart = 100)
fviz_silhouette(hc5, palette = "jco", ggtheme = theme_classic())

hc2 <- eclust(pca$x[,1:4], "hclust", k = kClusters2, graph = FALSE, stand=FALSE, iter.max = 100, 
              nstart = 100)
fviz_silhouette(hc2, palette = "jco", ggtheme = theme_classic()) 

# Comparando o resultado hclust com os labels originais
table(grp2 == wholesale2$Channel)

# Media dos clusters do hclust
mediahc2 <- wholesale_continuos  %>% mutate(Cluster = grp2)  %>% 
  group_by(Cluster)  %>% 
  summarise_all("mean")
mediahc2

mediahc5 <- wholesale_continuos  %>% mutate(Cluster = grp5)  %>% 
  group_by(Cluster)  %>% 
  summarise_all("mean")
mediahc5

# gerando output em formato de texto
sink("./output.txt", append = T)
mediahc2
mediahc5
sink()

# Comparando diversos algoritmos
# Veja mais algoritmos em: https://cran.r-project.org/web/packages/clValid/clValid.pdf
clmethods <- c("hierarchical","kmeans","pam")
# PAM é como o K-Means, mas utiliza medóides e pode ser utilizado com outras métricas de distância.
intern <- clValid(pca$x[,1:4], 
                  nClust = 2:6,
                  clMethods = clmethods,
                  validation = "internal",
                  neighbSize = 10)
summary(intern)

# gerando output em formato de texto
sink("./output.txt", append = T)
summary(intern)
sink()

# Interpretando os clusters
# Utilizando árvore nos dados originais
wholesale_continuos['cluster'] <- factor(km.res$cluster)
model = rpart(formula = cluster ~ ., data = wholesale_continuos, method='class')
fancyRpartPlot(model,sub="Modelo Decision Tree")

# criando os
wholesale_continuos['hclabel5'] <- factor(grp2)
wholesale_continuos['hclabel2'] <- factor(grp5)

wholesale2cont['hc.label5'] <- factor(grp2)
wholesale2cont['hc.label2'] <- factor(grp5)
str(wholesale2cont)

# Comparando clusters
# Analisando a importancia de cada categoria para cada um dos 5 clusters
wholesale_continuos %>%
  gather(Attributes, value, 1:6) %>% # ver as colunas dos dados 
  ggplot(aes(x=value, fill=label5cl, color=hclabel5)) +
  #geom_histogram(binwidth=1, alpha=.5, position="identity") +
  geom_density(alpha=.5) +
  facet_wrap(~Attributes, scales="free") +
  labs(x="Values", y="Frequency") 

# Boxplot
wholesale_continuos %>%
  gather(Attributes, value, 1:6) %>%
  ggplot(aes(x=value, fill=hclabel5, color=hclabel5)) +
  #geom_histogram(binwidth=1, alpha=.5, position="identity") +
  geom_boxplot(alpha=.5) +
  facet_wrap(~Attributes, scales="free") +
  labs(x="Values", y="Frequency")

# Analisando a importancia de cada categoria para os 2 clusters
wholesale_continuos %>%
  gather(Attributes, value, 1:6) %>% # ver as colunas dos dados 
  ggplot(aes(x=value, fill=hclabel2, color=hclabel2)) +
  #geom_histogram(binwidth=1, alpha=.5, position="identity") +
  geom_density(alpha=.5) +
  facet_wrap(~Attributes, scales="free") +
  labs(x="Values", y="Frequency") 

# Boxplot
wholesale_continuos %>%
  gather(Attributes, value, 1:6) %>%
  ggplot(aes(x=value, fill=hclabel2, color=hclabel2)) +
  #geom_histogram(binwidth=1, alpha=.5, position="identity") +
  geom_boxplot(alpha=.5) +
  facet_wrap(~Attributes, scales="free") +
  labs(x="Values", y="Frequency")


